import { Platform } from 'react-native';

import { admobConfig } from '@/constants/ads';
import { DEV_REWARDED_INVOICE_CREDIT, invoiceCreditFeatureRepository } from '@/features/credits';
import { INTERSTITIAL_SHOW_WAIT_MS, REWARDED_SHOW_WAIT_MS } from '@/services/ads/adLoadUtils';
import { initializeAds, isAdsInitialized } from '@/services/ads/initializeAds';
import { InterstitialAdService } from '@/services/ads/InterstitialAdService';
import { RewardedAdService } from '@/services/ads/RewardedAdService';
import type {
  AdMonetizationState,
  EarnRewardedCreditResult,
  RewardedDailyStatus,
} from '@/services/ads/types';
import { isDeviceOnline } from '@/services/network/isDeviceOnline';
import { canShowInterstitialAds, canShowRewardedAds } from '@/services/remote-config/adEligibility';
import { adMonetizationRepository, type AdMonetizationRepository } from '@/storage';
import { getMonetizationConfig } from '@/stores/remote-config/remote-config-store';

function getLocalDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDefaultState(date = new Date()): AdMonetizationState {
  return {
    successfulInvoiceCount: 0,
    rewardedDayKey: getLocalDayKey(date),
    rewardedRewardsToday: 0,
  };
}

function isAndroidAdMobSupported(): boolean {
  return Platform.OS === 'android';
}

function getRewardedDailyLimit(): number {
  return getMonetizationConfig().rewardedDailyLimit;
}

function getInterstitialFrequency(): number {
  return Math.max(1, getMonetizationConfig().interstitialFrequency);
}

function isPremiumUser(): boolean {
  return invoiceCreditFeatureRepository.getSnapshot().isPremium === true;
}

/**
 * Bridges AdMob events to the invoice credit system.
 * Credits remain owned by InvoiceCreditFeatureRepository.
 * Frequency/limits/flags come from Remote Config (Zustand).
 */
class AdMonetizationServiceImpl {
  public constructor(
    private readonly storageRepo: AdMonetizationRepository = adMonetizationRepository,
  ) {}

  public getRewardedDailyStatus(): RewardedDailyStatus {
    const state = this.readState();
    const dailyLimit = getRewardedDailyLimit();
    const remainingToday = Math.max(0, dailyLimit - state.rewardedRewardsToday);
    return {
      dayKey: state.rewardedDayKey,
      rewardsEarnedToday: state.rewardedRewardsToday,
      dailyLimit,
      remainingToday,
      hasReachedDailyLimit: state.rewardedRewardsToday >= dailyLimit,
    };
  }

  public canOfferRewardedAd(): boolean {
    if (!isAndroidAdMobSupported()) return false;
    if (!canShowRewardedAds(isPremiumUser())) return false;
    if (invoiceCreditFeatureRepository.hasAvailableCredits()) return false;
    return !this.getRewardedDailyStatus().hasReachedDailyLimit;
  }

  /**
   * Call only after a successful invoice create/duplicate.
   * Never blocks invoice generation; interstitial failures are ignored.
   */
  public onSuccessfulInvoiceGenerated(): void {
    try {
      const state = this.readState();
      const nextCount = state.successfulInvoiceCount + 1;
      this.storageRepo.update({
        ...state,
        successfulInvoiceCount: nextCount,
      });

      if (!isAndroidAdMobSupported()) return;
      if (!canShowInterstitialAds(isPremiumUser())) return;
      if (admobConfig.INTERSTITIAL_AD_UNIT_ID.length === 0) return;

      const frequency = getInterstitialFrequency();
      if (nextCount % frequency !== 0) return;

      void (async () => {
        if (!isAdsInitialized()) {
          const initialized = await initializeAds();
          if (!initialized) return;
        }

        const ready = await InterstitialAdService.waitUntilReady(INTERSTITIAL_SHOW_WAIT_MS);
        if (!ready) return;
        await InterstitialAdService.show();
      })().catch((error: unknown) => {
        if (__DEV__) {
          console.warn('[AdMob] Interstitial after invoice skipped:', error);
        }
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('[AdMob] Failed to record invoice for interstitial:', error);
      }
    }
  }

  /**
   * Shows a rewarded ad (user-initiated). Grants purchased credits only after
   * AdMob reports the reward was earned. Daily allowance increments only then.
   */
  public async earnCreditFromRewardedAd(): Promise<EarnRewardedCreditResult> {
    if (!isAndroidAdMobSupported()) {
      return 'unsupported';
    }

    if (!canShowRewardedAds(isPremiumUser())) {
      return 'disabled';
    }

    const monetization = getMonetizationConfig();
    if (!monetization.allowRewardedOffline) {
      const online = await isDeviceOnline();
      if (!online) {
        return 'offline';
      }
    }

    if (invoiceCreditFeatureRepository.hasAvailableCredits()) {
      return 'has_credits';
    }

    const daily = this.getRewardedDailyStatus();
    if (daily.hasReachedDailyLimit) {
      return 'daily_limit';
    }

    if (admobConfig.REWARDED_AD_UNIT_ID.length === 0) {
      return 'not_configured';
    }

    if (!isAdsInitialized()) {
      const initialized = await initializeAds();
      if (!initialized) {
        return 'unavailable';
      }
    }

    const ready = await RewardedAdService.waitUntilReady(REWARDED_SHOW_WAIT_MS);
    if (!ready) {
      RewardedAdService.preload();
      return 'unavailable';
    }

    let result;
    try {
      result = await RewardedAdService.show();
    } catch (error) {
      if (__DEV__) {
        console.warn('[AdMob] Rewarded show failed:', error);
      }
      RewardedAdService.preload();
      return 'unavailable';
    }

    if (!result.shown) {
      RewardedAdService.preload();
      return 'unavailable';
    }

    if (!result.rewarded) {
      return 'not_earned';
    }

    // Idempotent for this display: grant + count exactly once after earned callback.
    this.recordSuccessfulRewardedGrant();
    const creditAmount = __DEV__
      ? DEV_REWARDED_INVOICE_CREDIT
      : monetization.rewardedInvoiceCredit;
    invoiceCreditFeatureRepository.grantRewardedInvoiceCredit(creditAmount);
    return 'granted';
  }

  private recordSuccessfulRewardedGrant(): void {
    const state = this.readState();
    const dailyLimit = getRewardedDailyLimit();
    this.storageRepo.update({
      ...state,
      rewardedRewardsToday: Math.min(dailyLimit, state.rewardedRewardsToday + 1),
    });
  }

  private readState(): AdMonetizationState {
    const stored = this.storageRepo.get();
    const today = getLocalDayKey();
    const dailyLimit = getRewardedDailyLimit();

    if (stored == null) {
      const defaults = createDefaultState();
      this.storageRepo.update(defaults);
      return defaults;
    }

    const successfulInvoiceCount = Math.max(0, Math.floor(stored.successfulInvoiceCount || 0));

    if (stored.rewardedDayKey !== today) {
      const rolled: AdMonetizationState = {
        successfulInvoiceCount,
        rewardedDayKey: today,
        rewardedRewardsToday: 0,
      };
      this.storageRepo.update(rolled);
      return rolled;
    }

    return {
      successfulInvoiceCount,
      rewardedDayKey: stored.rewardedDayKey,
      rewardedRewardsToday: Math.max(
        0,
        Math.min(dailyLimit, Math.floor(stored.rewardedRewardsToday || 0)),
      ),
    };
  }
}

export const AdMonetizationService = new AdMonetizationServiceImpl();

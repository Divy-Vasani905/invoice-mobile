import { Platform } from 'react-native';

import { invoiceCreditFeatureRepository } from '@/features/credits';
import { INTERSTITIAL_EVERY_N_INVOICES, REWARDED_DAILY_LIMIT } from '@/services/ads/constants';
import { isAdsInitialized } from '@/services/ads/initializeAds';
import { InterstitialAdService } from '@/services/ads/InterstitialAdService';
import { RewardedAdService } from '@/services/ads/RewardedAdService';
import type {
  AdMonetizationState,
  EarnRewardedCreditResult,
  RewardedDailyStatus,
} from '@/services/ads/types';
import { adMonetizationRepository, type AdMonetizationRepository } from '@/storage';

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

/**
 * Bridges AdMob events to the invoice credit system.
 * Credits remain owned by InvoiceCreditFeatureRepository.
 */
class AdMonetizationServiceImpl {
  public constructor(
    private readonly storageRepo: AdMonetizationRepository = adMonetizationRepository,
  ) {}

  public getRewardedDailyStatus(): RewardedDailyStatus {
    const state = this.readState();
    const remainingToday = Math.max(0, REWARDED_DAILY_LIMIT - state.rewardedRewardsToday);
    return {
      dayKey: state.rewardedDayKey,
      rewardsEarnedToday: state.rewardedRewardsToday,
      dailyLimit: REWARDED_DAILY_LIMIT,
      remainingToday,
      hasReachedDailyLimit: state.rewardedRewardsToday >= REWARDED_DAILY_LIMIT,
    };
  }

  public canOfferRewardedAd(): boolean {
    if (!isAndroidAdMobSupported()) return false;
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
      if (!isAdsInitialized()) return;
      if (nextCount % INTERSTITIAL_EVERY_N_INVOICES !== 0) return;

      void InterstitialAdService.show().catch((error: unknown) => {
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
   * Shows a rewarded ad (user-initiated). Grants +1 purchased credit only after
   * AdMob reports the reward was earned. Daily allowance increments only then.
   */
  public async earnCreditFromRewardedAd(): Promise<EarnRewardedCreditResult> {
    if (!isAndroidAdMobSupported()) {
      return 'unsupported';
    }

    if (invoiceCreditFeatureRepository.hasAvailableCredits()) {
      return 'has_credits';
    }

    const daily = this.getRewardedDailyStatus();
    if (daily.hasReachedDailyLimit) {
      return 'daily_limit';
    }

    if (!isAdsInitialized()) {
      RewardedAdService.preload();
      return 'unavailable';
    }

    if (!RewardedAdService.isReady()) {
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
    invoiceCreditFeatureRepository.grantRewardedInvoiceCredit();
    return 'granted';
  }

  private recordSuccessfulRewardedGrant(): void {
    const state = this.readState();
    this.storageRepo.update({
      ...state,
      rewardedRewardsToday: Math.min(REWARDED_DAILY_LIMIT, state.rewardedRewardsToday + 1),
    });
  }

  private readState(): AdMonetizationState {
    const stored = this.storageRepo.get();
    const today = getLocalDayKey();

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
        Math.min(REWARDED_DAILY_LIMIT, Math.floor(stored.rewardedRewardsToday || 0)),
      ),
    };
  }
}

export const AdMonetizationService = new AdMonetizationServiceImpl();

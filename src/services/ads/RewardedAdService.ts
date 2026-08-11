import { Platform } from 'react-native';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  type RewardedAd as RewardedAdInstance,
} from 'react-native-google-mobile-ads';

import { admobConfig } from '@/constants/ads';

export type RewardedAdShowResult = {
  shown: boolean;
  /** True only when AdMob reports that the user earned the reward. */
  rewarded: boolean;
};

type Unsubscribe = () => void;

/**
 * Singleton rewarded ad loader/shower.
 * Rewards are granted only after `RewardedAdEventType.EARNED_REWARD`.
 */
class RewardedAdServiceImpl {
  private ad: RewardedAdInstance | null = null;
  private loaded = false;
  private loading = false;
  private showing = false;
  private unsubscribers: Unsubscribe[] = [];

  public isReady(): boolean {
    return this.loaded && this.ad != null;
  }

  public preload(): void {
    if (Platform.OS === 'web') return;
    if (admobConfig.REWARDED_AD_UNIT_ID.length === 0) {
      if (__DEV__) console.warn('[AdMob] Rewarded unit ID is empty — skip preload');
      return;
    }
    if (this.loading || this.loaded || this.showing) return;

    this.detach();
    this.loading = true;
    this.loaded = false;

    const ad = RewardedAd.createForAdRequest(admobConfig.REWARDED_AD_UNIT_ID);
    this.ad = ad;

    this.unsubscribers = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.loading = false;
        this.loaded = true;
        if (__DEV__) console.warn('[AdMob] Rewarded loaded');
      }),
      ad.addAdEventListener(AdEventType.ERROR, (error) => {
        this.loading = false;
        this.loaded = false;
        this.ad = null;
        if (__DEV__) console.warn('[AdMob] Rewarded failed to load:', error);
      }),
    ];

    try {
      ad.load();
    } catch (error) {
      this.loading = false;
      this.loaded = false;
      this.ad = null;
      if (__DEV__) console.warn('[AdMob] Rewarded load threw:', error);
    }
  }

  /**
   * Shows a loaded rewarded ad.
   * `rewarded` is true only if the user earned the reward callback before close.
   */
  public show(): Promise<RewardedAdShowResult> {
    if (Platform.OS === 'web') {
      return Promise.resolve({ shown: false, rewarded: false });
    }
    if (this.showing) {
      return Promise.resolve({ shown: false, rewarded: false });
    }

    if (!this.isReady() || this.ad == null) {
      this.preload();
      if (__DEV__) console.warn('[AdMob] Rewarded not ready');
      return Promise.resolve({ shown: false, rewarded: false });
    }

    const ad = this.ad;
    this.showing = true;
    this.loaded = false;

    return new Promise<RewardedAdShowResult>((resolve) => {
      let earned = false;
      let settled = false;

      const finish = (result: RewardedAdShowResult) => {
        if (settled) return;
        settled = true;
        this.showing = false;
        this.ad = null;
        this.detach();
        this.preload();
        resolve(result);
      };

      const unsubscribeEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
        if (__DEV__) console.warn('[AdMob] Rewarded earned');
      });

      const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubscribeEarned();
        unsubscribeClosed();
        finish({ shown: true, rewarded: earned });
      });

      const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
        if (__DEV__) console.warn('[AdMob] Rewarded error while showing:', error);
        unsubscribeEarned();
        unsubscribeClosed();
        unsubscribeError();
        finish({ shown: false, rewarded: false });
      });

      this.unsubscribers.push(unsubscribeEarned, unsubscribeClosed, unsubscribeError);

      void ad.show().catch((error: unknown) => {
        if (__DEV__) console.warn('[AdMob] Rewarded show failed:', error);
        unsubscribeEarned();
        unsubscribeClosed();
        unsubscribeError();
        finish({ shown: false, rewarded: false });
      });
    });
  }

  private detach(): void {
    for (const unsubscribe of this.unsubscribers) {
      try {
        unsubscribe();
      } catch {
        // ignore
      }
    }
    this.unsubscribers = [];
  }
}

export const RewardedAdService = new RewardedAdServiceImpl();

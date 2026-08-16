import { Platform } from 'react-native';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  type RewardedAd as RewardedAdInstance,
} from 'react-native-google-mobile-ads';

import { admobConfig } from '@/constants/ads';

import {
  extractAdError,
  logAdEvent,
  nextRetryDelayMs,
  notifyAdLoadWaiters,
  REWARDED_SHOW_WAIT_MS,
  type AdLoadWaiter,
} from './adLoadUtils';

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
  private retryAttempt = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private loadWaiters: AdLoadWaiter[] = [];
  private unsubscribers: Unsubscribe[] = [];

  public isReady(): boolean {
    return this.loaded && this.ad != null;
  }

  /**
   * Resolves when a rewarded ad is loaded, or when `timeoutMs` elapses.
   * Starts a preload if one is not already in flight.
   */
  public waitUntilReady(timeoutMs = REWARDED_SHOW_WAIT_MS): Promise<boolean> {
    if (this.isReady()) return Promise.resolve(true);
    if (admobConfig.REWARDED_AD_UNIT_ID.length === 0) return Promise.resolve(false);

    this.preload();

    return new Promise((resolve) => {
      let settled = false;
      const finish = (ready: boolean) => {
        if (settled) return;
        settled = true;
        this.loadWaiters = this.loadWaiters.filter((waiter) => waiter !== onReady);
        resolve(ready);
      };

      const onReady: AdLoadWaiter = (ready) => {
        clearTimeout(timer);
        finish(ready);
      };
      const timer = setTimeout(() => finish(this.isReady()), timeoutMs);
      this.loadWaiters.push(onReady);
    });
  }

  public preload(): void {
    if (Platform.OS === 'web') return;
    if (admobConfig.REWARDED_AD_UNIT_ID.length === 0) {
      logAdEvent('[AdMob] Rewarded unit ID is empty — skip preload');
      return;
    }
    if (this.loading || this.loaded || this.showing) return;

    this.clearRetryTimer();
    this.detach();
    this.loading = true;
    this.loaded = false;

    const ad = RewardedAd.createForAdRequest(admobConfig.REWARDED_AD_UNIT_ID);
    this.ad = ad;

    this.unsubscribers = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.loading = false;
        this.loaded = true;
        this.retryAttempt = 0;
        logAdEvent('[AdMob] Rewarded loaded');
        this.flushWaiters(true);
      }),
      ad.addAdEventListener(AdEventType.ERROR, (error) => {
        this.loading = false;
        this.loaded = false;
        this.ad = null;
        const { code, message } = extractAdError(error);
        logAdEvent(`[AdMob] Rewarded failed to load: ${code} ${message}`);
        this.scheduleRetry();
      }),
    ];

    try {
      ad.load();
    } catch (error) {
      this.loading = false;
      this.loaded = false;
      this.ad = null;
      const { code, message } = extractAdError(error);
      logAdEvent(`[AdMob] Rewarded load threw: ${code} ${message}`);
      this.scheduleRetry();
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
      logAdEvent('[AdMob] Rewarded not ready');
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
        logAdEvent('[AdMob] Rewarded earned');
      });

      const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubscribeEarned();
        unsubscribeClosed();
        finish({ shown: true, rewarded: earned });
      });

      const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
        const { code, message } = extractAdError(error);
        logAdEvent(`[AdMob] Rewarded error while showing: ${code} ${message}`);
        unsubscribeEarned();
        unsubscribeClosed();
        unsubscribeError();
        finish({ shown: false, rewarded: false });
      });

      this.unsubscribers.push(unsubscribeEarned, unsubscribeClosed, unsubscribeError);

      void ad.show().catch((error: unknown) => {
        const { code, message } = extractAdError(error);
        logAdEvent(`[AdMob] Rewarded show failed: ${code} ${message}`);
        unsubscribeEarned();
        unsubscribeClosed();
        unsubscribeError();
        finish({ shown: false, rewarded: false });
      });
    });
  }

  private scheduleRetry(): void {
    if (this.retryTimer != null || this.loading || this.loaded || this.showing) return;

    const userIsWaiting = this.loadWaiters.length > 0;
    const delay = nextRetryDelayMs(this.retryAttempt, userIsWaiting);
    this.retryAttempt += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.preload();
    }, delay);
  }

  private flushWaiters(ready: boolean): void {
    const waiters = this.loadWaiters;
    this.loadWaiters = [];
    notifyAdLoadWaiters(waiters, ready);
  }

  private clearRetryTimer(): void {
    if (this.retryTimer == null) return;
    clearTimeout(this.retryTimer);
    this.retryTimer = null;
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

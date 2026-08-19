import { Platform } from 'react-native';
import {
  AdEventType,
  InterstitialAd,
  type InterstitialAd as InterstitialAdInstance,
} from 'react-native-google-mobile-ads';

import { admobConfig } from '@/constants/ads';

import {
  extractAdError,
  FULLSCREEN_AD_SHOW_OPTIONS,
  INTERSTITIAL_SHOW_WAIT_MS,
  logAdEvent,
  nextRetryDelayMs,
  notifyAdLoadWaiters,
  waitForFullscreenAdSlot,
  type AdLoadWaiter,
} from './adLoadUtils';

type Unsubscribe = () => void;

/**
 * Singleton interstitial loader/shower.
 * Call `preload()` after SDK init; call `show()` from feature flows (never on every render).
 */
class InterstitialAdServiceImpl {
  private ad: InterstitialAdInstance | null = null;
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
   * Resolves when an interstitial is loaded, or when `timeoutMs` elapses.
   * Starts a preload if one is not already in flight.
   */
  public waitUntilReady(timeoutMs = INTERSTITIAL_SHOW_WAIT_MS): Promise<boolean> {
    if (this.isReady()) return Promise.resolve(true);
    if (admobConfig.INTERSTITIAL_AD_UNIT_ID.length === 0) return Promise.resolve(false);

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
    if (admobConfig.INTERSTITIAL_AD_UNIT_ID.length === 0) {
      logAdEvent('[AdMob] Interstitial unit ID is empty — skip preload');
      return;
    }
    if (this.loading || this.loaded || this.showing) return;

    this.clearRetryTimer();
    this.detach();
    this.loading = true;
    this.loaded = false;

    const ad = InterstitialAd.createForAdRequest(admobConfig.INTERSTITIAL_AD_UNIT_ID);
    this.ad = ad;

    this.unsubscribers = [
      ad.addAdEventListener(AdEventType.LOADED, () => {
        this.loading = false;
        this.loaded = true;
        this.retryAttempt = 0;
        logAdEvent('[AdMob] Interstitial loaded');
        this.flushWaiters(true);
      }),
      ad.addAdEventListener(AdEventType.ERROR, (error) => {
        this.loading = false;
        this.loaded = false;
        this.ad = null;
        const { code, message } = extractAdError(error);
        logAdEvent(`[AdMob] Interstitial failed to load: ${code} ${message}`);
        this.scheduleRetry();
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        this.showing = false;
        this.loaded = false;
        this.ad = null;
        this.detach();
        this.preload();
      }),
    ];

    try {
      ad.load();
    } catch (error) {
      this.loading = false;
      this.loaded = false;
      this.ad = null;
      const { code, message } = extractAdError(error);
      logAdEvent(`[AdMob] Interstitial load threw: ${code} ${message}`);
      this.scheduleRetry();
    }
  }

  /**
   * Shows a loaded interstitial. Returns false if unavailable (never throws).
   */
  public async show(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    if (this.showing) return false;

    if (!this.isReady()) {
      this.preload();
      logAdEvent('[AdMob] Interstitial not ready');
      return false;
    }

    try {
      this.showing = true;
      this.loaded = false;
      await waitForFullscreenAdSlot();
      await this.ad!.show(FULLSCREEN_AD_SHOW_OPTIONS);
      return true;
    } catch (error) {
      this.showing = false;
      this.loaded = false;
      this.ad = null;
      const { code, message } = extractAdError(error);
      logAdEvent(`[AdMob] Interstitial show failed: ${code} ${message}`);
      this.preload();
      return false;
    }
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

export const InterstitialAdService = new InterstitialAdServiceImpl();

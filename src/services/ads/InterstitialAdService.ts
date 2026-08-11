import { Platform } from 'react-native';
import {
  AdEventType,
  InterstitialAd,
  type InterstitialAd as InterstitialAdInstance,
} from 'react-native-google-mobile-ads';

import { admobConfig } from '@/constants/ads';

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
  private unsubscribers: Unsubscribe[] = [];

  public isReady(): boolean {
    return this.loaded && this.ad != null;
  }

  public preload(): void {
    if (Platform.OS === 'web') return;
    if (admobConfig.INTERSTITIAL_AD_UNIT_ID.length === 0) {
      if (__DEV__) console.warn('[AdMob] Interstitial unit ID is empty — skip preload');
      return;
    }
    if (this.loading || this.loaded || this.showing) return;

    this.detach();
    this.loading = true;
    this.loaded = false;

    const ad = InterstitialAd.createForAdRequest(admobConfig.INTERSTITIAL_AD_UNIT_ID);
    this.ad = ad;

    this.unsubscribers = [
      ad.addAdEventListener(AdEventType.LOADED, () => {
        this.loading = false;
        this.loaded = true;
        if (__DEV__) console.warn('[AdMob] Interstitial loaded');
      }),
      ad.addAdEventListener(AdEventType.ERROR, (error) => {
        this.loading = false;
        this.loaded = false;
        this.ad = null;
        if (__DEV__) console.warn('[AdMob] Interstitial failed to load:', error);
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
      if (__DEV__) console.warn('[AdMob] Interstitial load threw:', error);
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
      if (__DEV__) console.warn('[AdMob] Interstitial not ready');
      return false;
    }

    try {
      this.showing = true;
      this.loaded = false;
      await this.ad!.show();
      return true;
    } catch (error) {
      this.showing = false;
      this.loaded = false;
      this.ad = null;
      if (__DEV__) console.warn('[AdMob] Interstitial show failed:', error);
      this.preload();
      return false;
    }
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

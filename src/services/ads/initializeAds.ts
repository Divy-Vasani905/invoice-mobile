import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';

import { logAdMobEnvironment } from '@/constants/ads';

import { InterstitialAdService } from './InterstitialAdService';
import { RewardedAdService } from './RewardedAdService';

let initialized = false;
let initializing: Promise<boolean> | null = null;

/**
 * Initializes the Google Mobile Ads SDK once (dev client / production native builds).
 * Safe no-op on web. Preloads interstitial + rewarded after a successful init.
 */
export async function initializeAds(): Promise<boolean> {
  if (initialized) return true;
  if (Platform.OS === 'web') return false;

  if (initializing != null) {
    return initializing;
  }

  initializing = (async () => {
    try {
      logAdMobEnvironment();
      await mobileAds().initialize();
      initialized = true;

      InterstitialAdService.preload();
      RewardedAdService.preload();

      return true;
    } catch (error) {
      if (__DEV__) {
        console.warn('[AdMob] initialization skipped/failed:', error);
      }
      return false;
    } finally {
      initializing = null;
    }
  })();

  return initializing;
}

export function isAdsInitialized(): boolean {
  return initialized;
}

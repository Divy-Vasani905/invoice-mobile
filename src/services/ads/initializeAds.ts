import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';

import { admobConfig, logAdMobEnvironment } from '@/constants/ads';
import { CrashlyticsService } from '@/services/crashlytics';

import { logAdEvent } from './adLoadUtils';

let initialized = false;
let initializing: Promise<boolean> | null = null;

/**
 * Initializes the Google Mobile Ads SDK once (dev client / production native builds).
 * Safe no-op on web. Does not preload ads; those load when credits are low.
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
      logAdEvent(
        `[AdMob] Init start mode=${admobConfig.isUsingTestUnits ? 'TEST' : 'PRODUCTION'} units=${admobConfig.hasConfiguredUnits ? 'configured' : 'missing'}`,
      );
      void CrashlyticsService.setAttribute(
        'admob_mode',
        admobConfig.isUsingTestUnits ? 'TEST' : 'PRODUCTION',
      );
      void CrashlyticsService.setAttribute(
        'admob_units_configured',
        admobConfig.hasConfiguredUnits ? '1' : '0',
      );

      await mobileAds().initialize();
      initialized = true;
      logAdEvent('[AdMob] SDK initialized');

      return true;
    } catch (error) {
      logAdEvent('[AdMob] initialization skipped/failed');
      CrashlyticsService.recordError(error, 'AdMobInitializeFailed');
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

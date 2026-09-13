import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

import { env } from '@/constants/env';

/**
 * Google official sample App ID (Android) — fallback for native plugin config only.
 * @see https://developers.google.com/admob/android/test-ads
 */
export const GOOGLE_TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

/**
 * Force Google sample unit IDs whenever Metro is in development mode.
 * Production release builds (`__DEV__ === false`) use EXPO_PUBLIC_* unit IDs only.
 */
export const USE_ADMOB_TEST_UNITS = __DEV__;

const interstitialUnitId = USE_ADMOB_TEST_UNITS
  ? TestIds.INTERSTITIAL
  : env.admob.interstitialUnitId;

const rewardedUnitId = USE_ADMOB_TEST_UNITS ? TestIds.REWARDED : env.admob.rewardedUnitId;

export type AdMobConfig = {
  /** Native Android App ID (also configured via app.config.ts plugin). */
  ADMOB_ANDROID_APP_ID: string;
  /** Optional iOS App ID when iOS ads are enabled. */
  ADMOB_IOS_APP_ID: string;
  INTERSTITIAL_AD_UNIT_ID: string;
  REWARDED_AD_UNIT_ID: string;
  /** True when Google sample unit IDs are active (__DEV__). */
  isUsingTestUnits: boolean;
  /** True when interstitial/rewarded unit IDs are non-empty. */
  hasConfiguredUnits: boolean;
};

/**
 * Central AdMob configuration.
 * Development → Google TestIds (never production unit IDs).
 * Production → EXPO_PUBLIC_ADMOB_*_UNIT_ID only (never hardcoded).
 */
export const admobConfig: AdMobConfig = {
  ADMOB_ANDROID_APP_ID: env.admob.androidAppId || GOOGLE_TEST_ANDROID_APP_ID,
  ADMOB_IOS_APP_ID: env.admob.iosAppId,
  INTERSTITIAL_AD_UNIT_ID: interstitialUnitId,
  REWARDED_AD_UNIT_ID: rewardedUnitId,
  isUsingTestUnits: USE_ADMOB_TEST_UNITS,
  hasConfiguredUnits: interstitialUnitId.length > 0 && rewardedUnitId.length > 0,
};

/** @deprecated Prefer `admobConfig.INTERSTITIAL_AD_UNIT_ID` / `REWARDED_AD_UNIT_ID`. */
export const adUnitIds = {
  interstitial: admobConfig.INTERSTITIAL_AD_UNIT_ID,
  rewarded: admobConfig.REWARDED_AD_UNIT_ID,
} as const;

export type AdUnitIds = typeof adUnitIds;

export function logAdMobEnvironment(): void {
  if (!__DEV__) return;
  if (Platform.OS === 'web') {
    console.warn('[AdMob] Skipped on web');
    return;
  }
  console.warn(
    admobConfig.isUsingTestUnits
      ? '[AdMob] Using TEST ad units'
      : '[AdMob] Using PRODUCTION ad units',
  );
}

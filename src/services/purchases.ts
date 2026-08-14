import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

import { env } from '@/constants/env';

let initialized = false;

/**
 * Configures RevenueCat (Google Play Billing on Android, StoreKit on iOS).
 * Does not fetch offerings or initiate purchases.
 */
export async function initializePurchases(): Promise<boolean> {
  if (initialized || Platform.OS === 'web') {
    return initialized;
  }

  const apiKey = Platform.OS === 'ios' ? env.revenueCat.iosApiKey : env.revenueCat.androidApiKey;

  if (!apiKey) {
    if (__DEV__) {
      console.warn(
        '[purchases] missing RevenueCat API key for',
        Platform.OS,
        '— set EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY / EXPO_PUBLIC_REVENUECAT_IOS_API_KEY',
      );
    }
    return false;
  }

  try {
    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey });
    initialized = true;
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('[purchases] initialization skipped/failed:', error);
    }
    return false;
  }
}

export function isPurchasesInitialized(): boolean {
  return initialized;
}

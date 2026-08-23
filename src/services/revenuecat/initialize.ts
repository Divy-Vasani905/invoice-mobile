import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, type CustomerInfo } from 'react-native-purchases';

import { env } from '@/constants/env';

import { applyPremiumEntitlement, syncPremiumEntitlementFromCustomerInfo } from './entitlement';

let configured = false;
let listenerAttached = false;
let initializePromise: Promise<boolean> | null = null;

function resolveApiKey(): string {
  return Platform.OS === 'ios' ? env.revenueCat.iosApiKey : env.revenueCat.androidApiKey;
}

function onCustomerInfoUpdated(customerInfo: CustomerInfo): void {
  try {
    syncPremiumEntitlementFromCustomerInfo(customerInfo);
  } catch (error) {
    if (__DEV__) {
      console.warn('[revenuecat] failed syncing CustomerInfo update:', error);
    }
  }
}

async function fetchAndSyncCustomerInfo(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    syncPremiumEntitlementFromCustomerInfo(customerInfo);
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('[revenuecat] getCustomerInfo failed:', error);
    }
    // Do not grant Premium. Leave last mirror unchanged on transient failures
    // (SDK may still deliver a later CustomerInfo update via the listener).
    return false;
  }
}

function attachCustomerInfoListener(): void {
  if (listenerAttached) return;
  Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdated);
  listenerAttached = true;
}

async function configureAndSync(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  if (configured) {
    await fetchAndSyncCustomerInfo();
    return true;
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    if (__DEV__) {
      console.warn(
        '[revenuecat] missing public SDK key for',
        Platform.OS,
        '— set EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY / EXPO_PUBLIC_REVENUECAT_IOS_API_KEY',
      );
    }
    // Unverified local Premium must not grant access.
    applyPremiumEntitlement(false);
    return false;
  }

  try {
    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey });
    configured = true;
    attachCustomerInfoListener();
    await fetchAndSyncCustomerInfo();
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('[revenuecat] initialization skipped/failed:', error);
    }
    configured = false;
    applyPremiumEntitlement(false);
    return false;
  }
}

/**
 * Configures RevenueCat once, syncs the `premium` entitlement into app state,
 * and listens for CustomerInfo updates. Never throws; safe on network failure.
 */
export async function initializeRevenueCat(): Promise<boolean> {
  if (initializePromise != null) {
    return initializePromise;
  }

  initializePromise = configureAndSync().finally(() => {
    // Allow a later retry only when configure never succeeded (e.g. missing key then fixed).
    if (!configured) {
      initializePromise = null;
    }
  });

  return initializePromise;
}

export function isRevenueCatConfigured(): boolean {
  return configured;
}

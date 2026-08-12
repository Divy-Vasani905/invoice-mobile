import { initializeAds } from '@/services/ads';
import { initializeFirebase } from '@/services/firebase';
import { initializePurchases } from '@/services/purchases';
import { initializeRemoteConfig } from '@/services/remote-config';

export type ProductionServicesStatus = {
  firebase: boolean;
  ads: boolean;
  purchases: boolean;
  remoteConfig: boolean;
};

/**
 * Bootstraps production SDKs (Firebase, AdMob, RevenueCat, Remote Config).
 * Safe to call once at app start. Failures are isolated per service.
 * Remote Config hydrates local/defaults immediately and never blocks usability.
 */
export async function initializeProductionServices(): Promise<ProductionServicesStatus> {
  // Firebase app must be available before Remote Config modular APIs.
  const firebase = await initializeFirebase();

  const [ads, purchases, remoteConfig] = await Promise.all([
    initializeAds(),
    initializePurchases(),
    initializeRemoteConfig(),
  ]);

  return { firebase, ads, purchases, remoteConfig };
}

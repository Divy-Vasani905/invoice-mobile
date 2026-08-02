// Ads disabled for now — re-enable when AdMob is needed.
// import { initializeAds } from '@/services/ads';
import { initializeFirebase } from '@/services/firebase';
import { initializePurchases } from '@/services/purchases';

export type ProductionServicesStatus = {
  firebase: boolean;
  ads: boolean;
  purchases: boolean;
};

/**
 * Bootstraps production SDKs (Firebase, RevenueCat).
 * AdMob init is commented out until ads are needed.
 * Safe to call once at app start. Failures are isolated per service.
 */
export async function initializeProductionServices(): Promise<ProductionServicesStatus> {
  const [firebase, purchases] = await Promise.all([
    initializeFirebase(),
    // initializeAds(),
    initializePurchases(),
  ]);

  return { firebase, ads: false, purchases };
}

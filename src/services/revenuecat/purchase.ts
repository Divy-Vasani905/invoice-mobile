import Purchases, { PURCHASES_ERROR_CODE, type PurchasesPackage } from 'react-native-purchases';

import { syncPremiumEntitlementFromCustomerInfo } from './entitlement';
import { initializeRevenueCat, isRevenueCatConfigured } from './initialize';

export type PremiumPurchaseResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'missing_entitlement' }
  | {
      status: 'failed';
      reason: 'not_initialized' | 'purchase_failed';
    };

function isUserCancellation(error: unknown): boolean {
  if (error == null || typeof error !== 'object') return false;
  const candidate = error as {
    userCancelled?: boolean | null;
    code?: PURCHASES_ERROR_CODE | string;
  };
  return (
    candidate.userCancelled === true ||
    candidate.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  );
}

/**
 * Purchases a RevenueCat package, then syncs Premium from returned CustomerInfo.
 * Never grants Premium without an active `premium` entitlement.
 */
export async function purchasePremiumPackage(
  rcPackage: PurchasesPackage,
): Promise<PremiumPurchaseResult> {
  const ready = isRevenueCatConfigured() ? true : await initializeRevenueCat();
  if (!ready || !isRevenueCatConfigured()) {
    return { status: 'failed', reason: 'not_initialized' };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(rcPackage);
    const isPremium = syncPremiumEntitlementFromCustomerInfo(customerInfo);
    if (!isPremium) {
      return { status: 'missing_entitlement' };
    }
    return { status: 'success' };
  } catch (error) {
    if (isUserCancellation(error)) {
      return { status: 'cancelled' };
    }
    if (__DEV__) {
      console.warn('[revenuecat] purchasePackage failed:', error);
    }
    return { status: 'failed', reason: 'purchase_failed' };
  }
}

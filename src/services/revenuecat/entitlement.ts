import { revenueCatIds } from '@/constants/revenuecat';
import { INVOICE_CREDITS_QUERY_KEY, invoiceCreditFeatureRepository } from '@/features/credits';
import { queryClient } from '@/providers/query-client';

import type { CustomerInfo } from 'react-native-purchases';

const PREMIUM_ENTITLEMENT_ID = revenueCatIds.entitlements.premium;

/** True only when RevenueCat reports an active `premium` entitlement. */
export function hasActivePremiumEntitlement(customerInfo: CustomerInfo): boolean {
  return typeof customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== 'undefined';
}

/**
 * Writes RevenueCat entitlement result into the existing invoice-credit premium flag.
 * Call only with a verified CustomerInfo (or an explicit revocation when RC is unavailable).
 */
export function syncPremiumEntitlementFromCustomerInfo(customerInfo: CustomerInfo): boolean {
  const isPremium = hasActivePremiumEntitlement(customerInfo);
  applyPremiumEntitlement(isPremium);
  return isPremium;
}

/**
 * Clears or sets the local premium mirror. Never call with `true` unless CustomerInfo verified it.
 */
export function applyPremiumEntitlement(isPremium: boolean): void {
  const current = invoiceCreditFeatureRepository.getSnapshot().isPremium === true;
  if (current === isPremium) return;

  invoiceCreditFeatureRepository.setPremiumEntitlement(isPremium);
  void queryClient.invalidateQueries({ queryKey: INVOICE_CREDITS_QUERY_KEY });
}

import Purchases, { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';

import { initializeRevenueCat, isRevenueCatConfigured } from './initialize';

export type PremiumPlanId = 'monthly' | 'yearly';

export type PremiumPlanOption = {
  id: PremiumPlanId;
  title: string;
  /** Localized store price (e.g. "₹299.00"). */
  priceString: string;
  /** Human billing period suffix for UI (not a price). */
  periodLabel: string;
  rcPackage: PurchasesPackage;
};

export type PremiumOfferingLoadResult =
  | {
      status: 'ready';
      plans: PremiumPlanOption[];
      defaultPlanId: PremiumPlanId;
    }
  | {
      status: 'unavailable';
      reason: 'not_initialized' | 'no_current_offering' | 'no_usable_packages' | 'fetch_failed';
    };

function findPackageByType(
  packages: PurchasesPackage[],
  type: PACKAGE_TYPE,
): PurchasesPackage | null {
  return packages.find((pkg) => pkg.packageType === type) ?? null;
}

function toPlanOption(id: PremiumPlanId, rcPackage: PurchasesPackage): PremiumPlanOption {
  return {
    id,
    title: id === 'monthly' ? 'Monthly' : 'Yearly',
    priceString: rcPackage.product.priceString,
    periodLabel: id === 'monthly' ? 'month' : 'year',
    rcPackage,
  };
}

/**
 * Loads the current RevenueCat Offering and resolves Monthly + Annual packages.
 * Does not invent products or prices. Lifetime is intentionally ignored (Phase 7).
 */
export async function loadPremiumSubscriptionOffering(): Promise<PremiumOfferingLoadResult> {
  const ready = isRevenueCatConfigured() ? true : await initializeRevenueCat();
  if (!ready || !isRevenueCatConfigured()) {
    return { status: 'unavailable', reason: 'not_initialized' };
  }

  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (current == null) {
      return { status: 'unavailable', reason: 'no_current_offering' };
    }

    const monthlyPkg =
      current.monthly ?? findPackageByType(current.availablePackages, PACKAGE_TYPE.MONTHLY);
    const yearlyPkg =
      current.annual ?? findPackageByType(current.availablePackages, PACKAGE_TYPE.ANNUAL);

    const plans: PremiumPlanOption[] = [];
    if (monthlyPkg != null) plans.push(toPlanOption('monthly', monthlyPkg));
    if (yearlyPkg != null) plans.push(toPlanOption('yearly', yearlyPkg));

    if (plans.length === 0) {
      return { status: 'unavailable', reason: 'no_usable_packages' };
    }

    const defaultPlanId: PremiumPlanId = plans.some((plan) => plan.id === 'yearly')
      ? 'yearly'
      : 'monthly';

    return { status: 'ready', plans, defaultPlanId };
  } catch (error) {
    if (__DEV__) {
      console.warn('[revenuecat] getOfferings failed:', error);
    }
    return { status: 'unavailable', reason: 'fetch_failed' };
  }
}

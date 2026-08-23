/**
 * RevenueCat product / entitlement identifiers.
 * Match these IDs in Play Console / App Store Connect / RevenueCat dashboard.
 *
 * Phase 1: only `entitlements.premium` is read for entitlement sync.
 * Product IDs are placeholders for later purchase phases — not used yet.
 */
export const revenueCatIds = {
  entitlements: {
    /** Authoritative Premium access entitlement (RevenueCat → app state). */
    premium: 'premium',
    /** Reserved for a later phase; not used for Phase 1 entitlement sync. */
    removeAds: 'remove_ads',
  },
  products: {
    monthly: 'invoice_premium_monthly',
    yearly: 'invoice_premium_yearly',
    lifetimeRemoveAds: 'invoice_remove_ads_lifetime',
    lifetimePremium: 'invoice_premium_lifetime',
  },
} as const;

export type RevenueCatIds = typeof revenueCatIds;

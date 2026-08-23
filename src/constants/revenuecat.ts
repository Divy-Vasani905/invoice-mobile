/**
 * RevenueCat product / entitlement identifier placeholders.
 * Match these IDs in Play Console / App Store Connect / RevenueCat dashboard.
 * No purchase logic lives here.
 */
export const revenueCatIds = {
  entitlements: {
    premium: 'premium',
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

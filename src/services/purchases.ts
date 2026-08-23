/**
 * Purchases bootstrap entry point.
 * RevenueCat logic lives in `@/services/revenuecat`; this module keeps existing imports stable.
 */
export {
  initializeRevenueCat as initializePurchases,
  isRevenueCatConfigured as isPurchasesInitialized,
} from '@/services/revenuecat';

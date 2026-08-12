import { DEFAULT_MONETIZATION_CONFIG } from '@/services/remote-config/constants';

/**
 * Fallback defaults when Remote Config store is unavailable.
 * Prefer `getMonetizationConfig()` from the Remote Config Zustand store at runtime.
 */
export const INTERSTITIAL_EVERY_N_INVOICES = DEFAULT_MONETIZATION_CONFIG.interstitialFrequency;

/** @deprecated Prefer monetizationConfig.rewardedDailyLimit via Remote Config store. */
export const REWARDED_DAILY_LIMIT = DEFAULT_MONETIZATION_CONFIG.rewardedDailyLimit;

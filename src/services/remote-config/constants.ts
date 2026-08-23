/** Remote Config parameter keys (must match Firebase console). */
export const REMOTE_CONFIG_KEYS = {
  globalConfig: 'global_config',
  monetizationConfig: 'monetization_config',
} as const;

/** Development: short interval for testing. Production: 12 hours. */
export const REMOTE_CONFIG_MINIMUM_FETCH_INTERVAL_MS = __DEV__ ? 30_000 : 12 * 60 * 60 * 1000;

/** Optional update prompt dismissed for this duration when forceUpdate is false. */
export const APP_UPDATE_DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_GLOBAL_CONFIG = {
  forceUpdate: false,
  allowAppUsage: true,
} as const;

export const DEFAULT_MONETIZATION_CONFIG = {
  adsEnabled: true,
  interstitialEnabled: true,
  rewardedEnabled: true,
  interstitialFrequency: 6,
  rewardedDailyLimit: 10,
  freeInvoicesPerMonth: 20,
  rewardedInvoiceCredit: 1,
  premiumRemovesAds: true,
  allowRewardedOffline: false,
  allowInvoiceGenerationWithoutInternet: true,
  showAdsForPremiumUsers: false,
} as const;

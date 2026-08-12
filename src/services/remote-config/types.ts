export type GlobalConfig = {
  forceUpdate: boolean;
  allowAppUsage: boolean;
};

export type MonetizationConfig = {
  adsEnabled: boolean;
  interstitialEnabled: boolean;
  rewardedEnabled: boolean;
  interstitialFrequency: number;
  rewardedDailyLimit: number;
  freeInvoicesPerMonth: number;
  rewardedInvoiceCredit: number;
  premiumRemovesAds: boolean;
  allowRewardedOffline: boolean;
  allowInvoiceGenerationWithoutInternet: boolean;
  showAdsForPremiumUsers: boolean;
};

export type RemoteConfigSnapshot = {
  globalConfig: GlobalConfig;
  monetizationConfig: MonetizationConfig;
};

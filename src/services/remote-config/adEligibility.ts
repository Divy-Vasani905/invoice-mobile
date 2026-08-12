import type { MonetizationConfig } from '@/services/remote-config/types';
import { getMonetizationConfig } from '@/stores/remote-config/remote-config-store';

/**
 * Centralized premium/ad eligibility.
 * Master switch: adsEnabled. Premium rules applied after that.
 */
export function canShowAds(
  isPremium: boolean,
  config: MonetizationConfig = getMonetizationConfig(),
): boolean {
  if (!config.adsEnabled) return false;
  if (isPremium && config.premiumRemovesAds) return false;
  if (isPremium && !config.showAdsForPremiumUsers) return false;
  return true;
}

export function canShowInterstitialAds(
  isPremium: boolean,
  config: MonetizationConfig = getMonetizationConfig(),
): boolean {
  return canShowAds(isPremium, config) && config.interstitialEnabled;
}

export function canShowRewardedAds(
  isPremium: boolean,
  config: MonetizationConfig = getMonetizationConfig(),
): boolean {
  return canShowAds(isPremium, config) && config.rewardedEnabled;
}

import { AD_PRELOAD_CREDIT_THRESHOLD } from '@/services/ads/constants';
import { initializeAds } from '@/services/ads/initializeAds';
import { InterstitialAdService } from '@/services/ads/InterstitialAdService';
import { RewardedAdService } from '@/services/ads/RewardedAdService';

/**
 * Loads interstitial/rewarded ads only when the user is likely to see one soon.
 * Does not run at cold start.
 */
export function preloadAdsIfLowOnCredits(totalAvailable: number, isPremium: boolean): void {
  if (isPremium) return;
  if (totalAvailable >= AD_PRELOAD_CREDIT_THRESHOLD) return;

  void initializeAds().then((ok) => {
    if (!ok) return;
    InterstitialAdService.preload();
    RewardedAdService.preload();
  });
}

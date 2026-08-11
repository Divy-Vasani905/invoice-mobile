import { useCallback } from 'react';

import { isAdsInitialized } from '@/services/ads/initializeAds';
import { InterstitialAdService } from '@/services/ads/InterstitialAdService';
import { RewardedAdService, type RewardedAdShowResult } from '@/services/ads/RewardedAdService';

/**
 * Imperative helpers for interstitial ads. Does not auto-show on mount/render.
 */
export function useInterstitialAd() {
  const preload = useCallback(() => {
    InterstitialAdService.preload();
  }, []);

  const show = useCallback(async (): Promise<boolean> => {
    if (!isAdsInitialized()) return false;
    return InterstitialAdService.show();
  }, []);

  const isReady = useCallback(() => InterstitialAdService.isReady(), []);

  return { preload, show, isReady };
}

/**
 * Imperative helpers for rewarded ads. Does not auto-show on mount/render.
 * Grant in-app rewards only when `result.rewarded === true`.
 */
export function useRewardedAd() {
  const preload = useCallback(() => {
    RewardedAdService.preload();
  }, []);

  const show = useCallback(async (): Promise<RewardedAdShowResult> => {
    if (!isAdsInitialized()) {
      return { shown: false, rewarded: false };
    }
    return RewardedAdService.show();
  }, []);

  const isReady = useCallback(() => RewardedAdService.isReady(), []);

  return { preload, show, isReady };
}

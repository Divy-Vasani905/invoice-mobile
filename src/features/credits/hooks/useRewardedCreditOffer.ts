import { useCallback, useState } from 'react';

import { showToast } from '@/components/feedback/Toast';
import { useInvoiceCredits } from '@/features/credits/hooks/useInvoiceCredits';
import { AdMonetizationService, type RewardedDailyStatus } from '@/services/ads';

/**
 * User-initiated rewarded ad → +1 invoice credit offer.
 * Never auto-shows ads; grant only after AdMob reward-earned.
 */
export function useRewardedCreditOffer() {
  const { snapshot, hasAvailableCredits, invalidateCredits, isPremium } = useInvoiceCredits();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [rewardedDaily, setRewardedDaily] = useState<RewardedDailyStatus>(() =>
    AdMonetizationService.getRewardedDailyStatus(),
  );

  const refreshDailyStatus = useCallback(() => {
    setRewardedDaily(AdMonetizationService.getRewardedDailyStatus());
  }, []);

  const isDepleted = !isPremium && !hasAvailableCredits;
  const canWatchRewarded = isDepleted && AdMonetizationService.canOfferRewardedAd();

  const watchAdForCredit = useCallback(async () => {
    if (isWatchingAd) return;

    setIsWatchingAd(true);
    try {
      const result = await AdMonetizationService.earnCreditFromRewardedAd();
      refreshDailyStatus();
      await invalidateCredits();

      switch (result) {
        case 'granted':
          showToast('success', {
            title: 'Invoice credit earned',
            message: __DEV__
              ? 'Development: 10 invoice credits added.'
              : 'You can create 1 invoice now.',
          });
          break;
        case 'daily_limit':
          showToast('info', {
            title: 'Daily reward limit reached',
            message: 'Try again tomorrow.',
          });
          break;
        case 'not_earned':
          showToast('info', {
            title: 'No credit earned',
            message: 'Watch the full ad to earn an invoice credit.',
          });
          break;
        case 'unavailable':
          showToast('warning', {
            title: 'Ad unavailable',
            message: 'No ad is ready right now. Please try again in a minute.',
          });
          break;
        case 'offline':
          showToast('warning', {
            title: 'You are offline',
            message: 'Connect to the internet to watch an ad.',
          });
          break;
        case 'disabled':
          showToast('info', {
            title: 'Ads unavailable',
            message: 'Rewarded ads are turned off right now.',
          });
          break;
        case 'not_configured':
          showToast('warning', {
            title: 'Ad unavailable',
            message: 'Ads are not configured in this build.',
          });
          break;
        case 'has_credits':
          showToast('info', {
            title: 'Credits available',
            message: 'You already have invoices remaining.',
          });
          break;
        case 'unsupported':
          showToast('info', {
            title: 'Ads unavailable',
            message: 'Rewarded ads are available on Android.',
          });
          break;
      }
    } finally {
      setIsWatchingAd(false);
    }
  }, [invalidateCredits, isWatchingAd, refreshDailyStatus]);

  return {
    snapshot,
    isDepleted,
    isPremium,
    isWatchingAd,
    canWatchRewarded,
    rewardedDaily,
    refreshDailyStatus,
    watchAdForCredit,
  };
}

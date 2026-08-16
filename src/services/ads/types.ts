/**
 * Local AdMob monetization counters (not the invoice credit ledger).
 * Persisted via MMKV; AdMob never owns invoice credits directly.
 */
export type AdMonetizationState = {
  /** Successful invoice creations/duplicates since install (interstitial frequency). */
  successfulInvoiceCount: number;
  /** Local calendar day key `YYYY-MM-DD` for rewarded daily limit. */
  rewardedDayKey: string;
  /** Successful rewarded-ad credit grants on `rewardedDayKey`. */
  rewardedRewardsToday: number;
};

export type RewardedDailyStatus = {
  dayKey: string;
  rewardsEarnedToday: number;
  dailyLimit: number;
  remainingToday: number;
  hasReachedDailyLimit: boolean;
};

export type EarnRewardedCreditResult =
  | 'granted'
  | 'daily_limit'
  | 'not_earned'
  | 'unavailable'
  | 'has_credits'
  | 'unsupported'
  | 'offline'
  | 'disabled'
  | 'not_configured';

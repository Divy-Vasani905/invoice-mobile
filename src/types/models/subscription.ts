import type { OfflineEntity } from '@/types/models/common';

export enum SubscriptionProvider {
  AppStore = 'app_store',
  GooglePlay = 'google_play',
}

export enum SubscriptionPlan {
  Monthly = 'monthly',
  Yearly = 'yearly',
  Lifetime = 'lifetime',
}

export enum SubscriptionStatus {
  Active = 'active',
  GracePeriod = 'grace_period',
  Paused = 'paused',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

export interface Subscription extends OfflineEntity {
  provider: SubscriptionProvider;
  productId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  purchasedAt: string;
  expiresAt?: string;
  willRenew: boolean;
  originalTransactionId?: string;
}

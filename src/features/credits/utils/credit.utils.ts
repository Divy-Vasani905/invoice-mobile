import { MONTHLY_FREE_INVOICE_LIMIT } from '@/features/credits/constants';
import type {
  InvoiceCreditBalance,
  InvoiceCreditEntitlement,
  InvoiceCreditSnapshot,
  InvoiceCreditSource,
} from '@/types/models';

/** Local calendar period key (`YYYY-MM`). */
export function getCurrentPeriodKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/** ISO timestamp for local midnight on the first day of next month. */
export function getNextResetAt(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0).toISOString();
}

export function createDefaultCreditBalance(date = new Date()): InvoiceCreditBalance {
  return {
    periodKey: getCurrentPeriodKey(date),
    monthlyFreeLimit: MONTHLY_FREE_INVOICE_LIMIT,
    monthlyUsed: 0,
    purchasedCredits: 0,
    isPremium: false,
  };
}

export function clampNonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

/**
 * Rolls free usage into a new month when the stored period is stale.
 * Purchased credits and premium flag are preserved.
 */
export function ensureCurrentPeriod(
  balance: InvoiceCreditBalance,
  date = new Date(),
): InvoiceCreditBalance {
  const periodKey = getCurrentPeriodKey(date);
  if (balance.periodKey === periodKey) {
    return {
      ...balance,
      monthlyFreeLimit: clampNonNegative(balance.monthlyFreeLimit) || MONTHLY_FREE_INVOICE_LIMIT,
      monthlyUsed: clampNonNegative(balance.monthlyUsed),
      purchasedCredits: clampNonNegative(balance.purchasedCredits),
      isPremium: balance.isPremium === true,
    };
  }

  return {
    ...balance,
    periodKey,
    monthlyFreeLimit: clampNonNegative(balance.monthlyFreeLimit) || MONTHLY_FREE_INVOICE_LIMIT,
    monthlyUsed: 0,
    purchasedCredits: clampNonNegative(balance.purchasedCredits),
    isPremium: balance.isPremium === true,
  };
}

export function toCreditSnapshot(
  balance: InvoiceCreditBalance,
  date = new Date(),
): InvoiceCreditSnapshot {
  const normalized = ensureCurrentPeriod(balance, date);
  const monthlyRemaining = Math.max(0, normalized.monthlyFreeLimit - normalized.monthlyUsed);
  const purchasedCredits = clampNonNegative(normalized.purchasedCredits);
  const isPremium = normalized.isPremium === true;
  const totalAvailable = monthlyRemaining + purchasedCredits;

  return {
    periodKey: normalized.periodKey,
    monthlyFreeLimit: normalized.monthlyFreeLimit,
    monthlyUsed: Math.min(normalized.monthlyUsed, normalized.monthlyFreeLimit),
    monthlyRemaining,
    purchasedCredits,
    totalAvailable,
    isPremium,
    nextResetAt: getNextResetAt(date),
    hasAvailableCredits: isPremium || monthlyRemaining > 0 || purchasedCredits > 0,
  };
}

export function formatResetDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function toEntitlement(snapshot: InvoiceCreditSnapshot): InvoiceCreditEntitlement {
  return {
    isPremium: snapshot.isPremium,
    unlimitedInvoices: snapshot.isPremium,
  };
}

export function resolveCreditSource(snapshot: InvoiceCreditSnapshot): InvoiceCreditSource | null {
  if (snapshot.isPremium) return 'premium';
  if (snapshot.monthlyRemaining > 0) return 'monthly_free';
  if (snapshot.purchasedCredits > 0) return 'purchased';
  return null;
}

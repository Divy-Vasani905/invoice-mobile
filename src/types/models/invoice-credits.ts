/**
 * Invoice credit / usage entitlements.
 * Purchased credits and premium are modeled for future monetization —
 * this module does not process payments or ads.
 */

/** Persisted credit ledger for the local device/user. */
export interface InvoiceCreditBalance {
  /** Billing period key in `YYYY-MM` (local calendar month). */
  periodKey: string;
  /** Free invoices allowed per calendar month. */
  monthlyFreeLimit: number;
  /** Free invoices consumed in the current period. */
  monthlyUsed: number;
  /** Purchased credits that persist across months until consumed. */
  purchasedCredits: number;
  /**
   * Premium entitlement flag.
   * Must only become true when a real subscription/entitlement check succeeds.
   */
  isPremium: boolean;
}

/** Read-model used by UI and creation gates. */
export interface InvoiceCreditSnapshot {
  periodKey: string;
  monthlyFreeLimit: number;
  monthlyUsed: number;
  /** `max(0, monthlyFreeLimit - monthlyUsed)` */
  monthlyRemaining: number;
  purchasedCredits: number;
  /** Free remaining + purchased (premium treated as unlimited separately). */
  totalAvailable: number;
  isPremium: boolean;
  /** ISO timestamp for the start of the next local calendar month. */
  nextResetAt: string;
  hasAvailableCredits: boolean;
}

/** Which pool was charged when an invoice credit was consumed. */
export type InvoiceCreditSource = 'monthly_free' | 'purchased' | 'premium';

/** Future-facing purchase intent — not wired to payments yet. */
export interface InvoiceCreditPurchaseIntent {
  productId: string;
  credits: number;
}

/** Future-facing entitlement summary for premium / unlimited plans. */
export interface InvoiceCreditEntitlement {
  isPremium: boolean;
  unlimitedInvoices: boolean;
}

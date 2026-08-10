import { invoiceCreditRepository, type InvoiceCreditRepository } from '@/storage';
import type {
  InvoiceCreditBalance,
  InvoiceCreditEntitlement,
  InvoiceCreditSnapshot,
  InvoiceCreditSource,
} from '@/types/models';

import { MONTHLY_FREE_INVOICE_LIMIT } from '../constants';
import {
  createDefaultCreditBalance,
  ensureCurrentPeriod,
  resolveCreditSource,
  toCreditSnapshot,
  toEntitlement,
} from '../utils/credit.utils';

export class InsufficientInvoiceCreditsError extends Error {
  public constructor() {
    super('No invoices remaining. Your free allowance resets next month.');
    this.name = 'InsufficientInvoiceCreditsError';
  }
}

/**
 * Domain repository for invoice credit / usage.
 * Consumption order: monthly free → purchased credits (premium skips consume).
 */
export class InvoiceCreditFeatureRepository {
  public constructor(
    private readonly storageRepo: InvoiceCreditRepository = invoiceCreditRepository,
  ) {}

  public getSnapshot(): InvoiceCreditSnapshot {
    return toCreditSnapshot(this.readBalance());
  }

  public getEntitlement(): InvoiceCreditEntitlement {
    return toEntitlement(this.getSnapshot());
  }

  public hasAvailableCredits(): boolean {
    return this.getSnapshot().hasAvailableCredits;
  }

  public assertCanCreateInvoice(): void {
    if (!this.hasAvailableCredits()) {
      throw new InsufficientInvoiceCreditsError();
    }
  }

  /**
   * Consumes one invoice credit using free allowance first, then purchased.
   * Premium users are not charged.
   */
  public consumeCredit(): InvoiceCreditSource {
    const balance = this.readBalance();
    const snapshot = toCreditSnapshot(balance);
    const source = resolveCreditSource(snapshot);

    if (source == null) {
      throw new InsufficientInvoiceCreditsError();
    }

    if (source === 'premium') {
      return source;
    }

    const next: InvoiceCreditBalance =
      source === 'monthly_free'
        ? {
            ...ensureCurrentPeriod(balance),
            monthlyUsed: ensureCurrentPeriod(balance).monthlyUsed + 1,
          }
        : {
            ...ensureCurrentPeriod(balance),
            purchasedCredits: Math.max(0, ensureCurrentPeriod(balance).purchasedCredits - 1),
          };

    this.storageRepo.update(next);
    return source;
  }

  /**
   * Future monetization hook — adds purchased credits without touching free allowance.
   * Not exposed in UI until payments are implemented.
   */
  public addPurchasedCredits(amount: number): InvoiceCreditSnapshot {
    const credits = Math.max(0, Math.floor(amount));
    const balance = ensureCurrentPeriod(this.readBalance());
    this.storageRepo.update({
      ...balance,
      purchasedCredits: balance.purchasedCredits + credits,
    });
    return this.getSnapshot();
  }

  /**
   * Future monetization hook — apply a real premium entitlement result.
   * Do not call with `true` unless a verified subscription check succeeded.
   */
  public setPremiumEntitlement(isPremium: boolean): InvoiceCreditSnapshot {
    const balance = ensureCurrentPeriod(this.readBalance());
    this.storageRepo.update({
      ...balance,
      isPremium,
    });
    return this.getSnapshot();
  }

  private readBalance(): InvoiceCreditBalance {
    const stored = this.storageRepo.get();
    if (stored == null) {
      const defaults = createDefaultCreditBalance();
      this.storageRepo.update(defaults);
      return defaults;
    }

    const normalized = ensureCurrentPeriod({
      ...stored,
      monthlyFreeLimit: stored.monthlyFreeLimit || MONTHLY_FREE_INVOICE_LIMIT,
    });

    if (
      stored.periodKey !== normalized.periodKey ||
      stored.monthlyUsed !== normalized.monthlyUsed ||
      stored.monthlyFreeLimit !== normalized.monthlyFreeLimit ||
      stored.purchasedCredits !== normalized.purchasedCredits
    ) {
      this.storageRepo.update(normalized);
    }

    return normalized;
  }
}

export const invoiceCreditFeatureRepository = new InvoiceCreditFeatureRepository();

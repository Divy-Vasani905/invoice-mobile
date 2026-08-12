import { DEFAULT_MONETIZATION_CONFIG } from '@/services/remote-config/constants';

/**
 * Fallback monthly free invoice allowance.
 * Runtime value comes from monetizationConfig.freeInvoicesPerMonth (Zustand).
 */
export const MONTHLY_FREE_INVOICE_LIMIT = DEFAULT_MONETIZATION_CONFIG.freeInvoicesPerMonth;

/** Header indicator emphasizes remaining free invoices at or below this count. */
export const CREDIT_LOW_THRESHOLD = 5;

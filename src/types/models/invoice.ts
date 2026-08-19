import type { Address, Money, OfflineEntity } from '@/types/models/common';
import type { InvoiceItem } from '@/types/models/invoice-item';

export enum InvoiceStatus {
  Draft = 'draft',
  Issued = 'issued',
  Sent = 'sent',
  Paid = 'paid',
  PartiallyPaid = 'partially_paid',
  Overdue = 'overdue',
  Cancelled = 'cancelled',
}

export interface InvoicePartySnapshot {
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  taxId?: string;
  /** Optional brand mark captured for document preview (business only). */
  logoUri?: string;
  companyName?: string;
}

/** Snapshot of the invoice-level tax applied at save time. */
export interface InvoiceAppliedTax {
  taxId?: string;
  name: string;
  rateBasisPoints: number;
  amount: Money;
}

export interface InvoiceTotals {
  subtotalAmount: Money;
  discountAmount: Money;
  taxAmount: Money;
  roundOffAmount: Money;
  totalAmount: Money;
  paidAmount: Money;
  balanceAmount: Money;
}

export interface InvoiceDocument {
  uri: string;
  generatedAt: string;
  checksum?: string;
}

export interface Invoice extends OfflineEntity {
  businessId: string;
  customerId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt?: string;
  currencyCode: string;
  business: InvoicePartySnapshot;
  customer: InvoicePartySnapshot;
  /** Line items snapshotted at save time for historical integrity. */
  items: InvoiceItem[];
  totals: InvoiceTotals;
  /**
   * Invoice-level tax captured at save time.
   * `undefined` = legacy invoices that used per-line tax only.
   * `null` = explicitly no tax.
   */
  appliedTax?: InvoiceAppliedTax | null;
  notes?: string;
  terms?: string;
  document?: InvoiceDocument;
}

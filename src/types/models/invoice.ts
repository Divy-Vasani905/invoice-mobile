import type { Address, Money, OfflineEntity } from '@/types/models/common';

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
}

export interface InvoiceTotals {
  subtotalAmount: Money;
  discountAmount: Money;
  taxAmount: Money;
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
  totals: InvoiceTotals;
  notes?: string;
  terms?: string;
  document?: InvoiceDocument;
}

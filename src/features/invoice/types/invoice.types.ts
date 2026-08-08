import type { BadgeVariant } from '@/theme';
import type { Invoice, InvoiceStatus } from '@/types/models';

export type InvoiceListFilter = 'all' | 'paid' | 'pending' | 'overdue' | 'draft';

export type InvoiceDisplayStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft' | 'Cancelled';

export interface InvoiceListItem {
  invoice: Invoice;
  displayStatus: InvoiceDisplayStatus;
  badgeVariant: BadgeVariant;
  formattedAmount: string;
  formattedDate: string;
  customerName: string;
}

export interface InvoiceFormItemValues {
  id: string;
  productId: string;
  name: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  discount: string;
}

export interface InvoiceFormValues {
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issuedAt: string;
  dueAt: string;
  currencyCode: string;
  notes: string;
  items: InvoiceFormItemValues[];
  status: InvoiceStatus;
}

export interface InvoiceNumberReservation {
  invoiceNumber: string;
  nextNumber: number;
  prefix: string;
  paddingLength: number;
}

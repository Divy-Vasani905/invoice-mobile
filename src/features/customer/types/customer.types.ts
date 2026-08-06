import type { Customer } from '@/types/models';

export interface CustomerFormValues {
  displayName: string;
  companyName: string;
  phone: string;
  email: string;
  taxId: string;
  billingAddress: string;
  notes: string;
}

export interface CustomerSummary {
  customer: Customer;
  invoiceCount: number;
  totalInvoiceAmountMinor: number;
  currencyCode: string;
}

export interface CustomerMutationInput {
  values: CustomerFormValues;
  customerId?: string;
}

export class CustomerHasInvoicesError extends Error {
  public constructor(public readonly invoiceCount: number) {
    super(
      `This customer is linked to ${invoiceCount} ${
        invoiceCount === 1 ? 'invoice' : 'invoices'
      } and cannot be deleted.`,
    );
    this.name = 'CustomerHasInvoicesError';
  }
}

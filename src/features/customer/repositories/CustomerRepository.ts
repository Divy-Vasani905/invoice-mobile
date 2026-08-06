import {
  businessRepository,
  customerRepository,
  invoiceRepository,
  type CustomerRepository as CustomerStorageRepository,
  type InvoiceRepository,
} from '@/storage';
import { SyncStatus, type Customer } from '@/types/models';

import { CustomerHasInvoicesError } from '../types/customer.types';
import { compactOptional, createLocalId, toAddress } from '../utils/customer.utils';

import type { CustomerFormValues, CustomerSummary } from '../types/customer.types';

const LOCAL_BUSINESS_ID = 'local-business';

export class CustomerRepository {
  public constructor(
    private readonly customers: CustomerStorageRepository = customerRepository,
    private readonly invoices: InvoiceRepository = invoiceRepository,
  ) {}

  public getCustomers(): CustomerSummary[] {
    const invoices = this.invoices.getAll();
    const currencyCode = businessRepository.get()?.defaultCurrencyCode ?? 'USD';

    return this.customers
      .getAll()
      .filter((customer) => customer.syncStatus !== SyncStatus.Deleted)
      .map((customer) => {
        const customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id);
        return {
          customer,
          invoiceCount: customerInvoices.length,
          totalInvoiceAmountMinor: customerInvoices.reduce(
            (total, invoice) =>
              invoice.currencyCode === currencyCode
                ? total + invoice.totals.totalAmount.amountMinor
                : total,
            0,
          ),
          currencyCode,
        };
      })
      .sort((left, right) => left.customer.displayName.localeCompare(right.customer.displayName));
  }

  public getCustomerById(customerId: string): Customer | null {
    return this.customers.getById(customerId);
  }

  public createCustomer(values: CustomerFormValues): Customer {
    const timestamp = new Date().toISOString();
    const customer: Customer = {
      ...toPersistedFields(values),
      id: createLocalId('customer'),
      businessId: businessRepository.get()?.id ?? LOCAL_BUSINESS_ID,
      createdAt: timestamp,
      updatedAt: timestamp,
      localRevision: 1,
      syncStatus: SyncStatus.Pending,
    };
    this.customers.create(customer);
    return customer;
  }

  public updateCustomer(customerId: string, values: CustomerFormValues): Customer {
    const current = this.requireCustomer(customerId);
    const customer: Customer = {
      ...current,
      ...toPersistedFields(values),
      updatedAt: new Date().toISOString(),
      localRevision: current.localRevision + 1,
      syncStatus: SyncStatus.Pending,
    };
    this.customers.update(customer);
    return customer;
  }

  public deleteCustomer(customerId: string): void {
    const invoiceCount = this.invoices
      .getAll()
      .filter((invoice) => invoice.customerId === customerId).length;
    if (invoiceCount > 0) throw new CustomerHasInvoicesError(invoiceCount);
    this.customers.delete(customerId);
  }

  private requireCustomer(customerId: string): Customer {
    const customer = this.customers.getById(customerId);
    if (customer == null) throw new Error('Customer not found.');
    return customer;
  }
}

function toPersistedFields(values: CustomerFormValues) {
  return {
    displayName: values.displayName.trim(),
    companyName: compactOptional(values.companyName),
    phone: compactOptional(values.phone),
    email: compactOptional(values.email),
    taxId: compactOptional(values.taxId),
    billingAddress: toAddress(values.billingAddress),
    notes: compactOptional(values.notes),
  };
}

export const customerFeatureRepository = new CustomerRepository();

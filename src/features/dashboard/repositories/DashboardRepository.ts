import { productFeatureRepository } from '@/features/product/repositories/ProductRepository';
import { businessRepository, invoiceRepository } from '@/storage';
import { InvoiceStatus, type Invoice as DomainInvoice } from '@/types/models';

import type {
  DashboardData,
  Invoice,
  InvoiceStatus as DashboardInvoiceStatus,
} from '../types/dashboard.types';

const RECENT_INVOICE_LIMIT = 6;

/** Read-only dashboard projection built from the existing local repositories. */
export class DashboardRepository {
  public get(): DashboardData {
    const business = businessRepository.get();
    const invoices = invoiceRepository.getAll();
    const currencyCode = business?.defaultCurrencyCode ?? 'USD';
    const now = new Date();
    const monthlyRevenue = sumRevenue(invoices, (date) => sameMonth(date, now));
    const weeklyRevenue = sumRevenue(invoices, (date) => withinDays(date, now, 7));

    return {
      business: {
        name: business?.displayName ?? business?.legalName ?? '',
        monthlyRevenue: toMajorUnits(monthlyRevenue, currencyCode),
        weeklyRevenue: toMajorUnits(weeklyRevenue, currencyCode),
        revenueGrowth: 0,
        currencyCode,
      },
      recentInvoices: invoices
        .sort((left, right) => right.issuedAt.localeCompare(left.issuedAt))
        .slice(0, RECENT_INVOICE_LIMIT)
        .map(toDashboardInvoice),
      recentProducts: productFeatureRepository.getRecentProducts(),
      quickActions: [],
    };
  }
}

function sumRevenue(invoices: DomainInvoice[], predicate: (date: Date) => boolean): number {
  return invoices
    .filter(
      (invoice) => invoice.status === InvoiceStatus.Paid && predicate(new Date(invoice.issuedAt)),
    )
    .reduce((total, invoice) => total + invoice.totals.paidAmount.amountMinor, 0);
}

function toMajorUnits(amountMinor: number, currencyCode: string): number {
  const fractionDigits = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).resolvedOptions().maximumFractionDigits;
  return amountMinor / 10 ** (fractionDigits ?? 2);
}

function toDashboardInvoice(invoice: DomainInvoice): Invoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customerName: invoice.customer.name,
    amount: toMajorUnits(
      invoice.totals.totalAmount.amountMinor,
      invoice.totals.totalAmount.currencyCode,
    ),
    status: mapInvoiceStatus(invoice.status),
    date: new Intl.DateTimeFormat().format(new Date(invoice.issuedAt)),
  };
}

function mapInvoiceStatus(status: InvoiceStatus): DashboardInvoiceStatus {
  if (status === InvoiceStatus.Paid) return 'Paid';
  if (status === InvoiceStatus.Overdue) return 'Overdue';
  if (status === InvoiceStatus.Draft) return 'Draft';
  return 'Pending';
}

function sameMonth(date: Date, now: Date): boolean {
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function withinDays(date: Date, now: Date, days: number): boolean {
  return date.getTime() >= now.getTime() - days * 24 * 60 * 60 * 1000;
}

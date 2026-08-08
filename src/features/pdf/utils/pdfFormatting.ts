import {
  formatAddress,
  formatInvoiceDate,
  formatMoney,
  getProductUnitLabel,
  mapInvoiceStatus,
  resolveEffectiveStatus,
} from '@/features/invoice/utils/invoice.utils';
import type { Business, Invoice } from '@/types/models';

import type {
  InvoicePdfDocumentModel,
  InvoicePdfLineItem,
  InvoicePdfParty,
} from '../types/pdf.types';

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatPdfDate(iso: string): string {
  return formatInvoiceDate(iso);
}

export function formatPdfMoney(amountMinor: number, currencyCode: string): string {
  return formatMoney(amountMinor, currencyCode);
}

export function formatTaxRateLabel(taxRateBasisPoints: number): string | undefined {
  if (taxRateBasisPoints <= 0) return undefined;
  const percent = taxRateBasisPoints / 100;
  const normalized = Number.isInteger(percent) ? String(percent) : percent.toFixed(2);
  return `${normalized}%`;
}

export function buildContentFingerprint(invoice: Invoice, templateId: string): string {
  // Exclude updatedAt so PDF metadata writes do not invalidate the cache.
  const itemSignature = (invoice.items ?? [])
    .map(
      (item) =>
        `${item.id}:${item.quantity}:${item.unitPrice.amountMinor}:${item.discountAmount.amountMinor}:${item.taxRateBasisPoints}:${item.totalAmount.amountMinor}:${item.product.name}`,
    )
    .join('|');
  return [
    invoice.id,
    templateId,
    invoice.invoiceNumber,
    invoice.status,
    invoice.issuedAt,
    invoice.dueAt ?? '',
    invoice.currencyCode,
    invoice.customer.name,
    invoice.notes ?? '',
    invoice.totals.totalAmount.amountMinor,
    invoice.totals.taxAmount.amountMinor,
    invoice.totals.discountAmount.amountMinor,
    itemSignature,
  ].join('::');
}

export function toPdfParty(
  party: Invoice['business'] | Invoice['customer'],
  options?: {
    website?: string;
    logoDataUri?: string;
    signatureDataUri?: string;
  },
): InvoicePdfParty {
  const address = formatAddress(party.address);
  return {
    name: party.name || '—',
    companyName: party.companyName,
    email: party.email,
    phone: party.phone,
    website: options?.website,
    taxId: party.taxId,
    addressLines: address.length > 0 ? address.split(', ') : [],
    logoDataUri: options?.logoDataUri,
    signatureDataUri: options?.signatureDataUri,
  };
}

export function toPdfLineItems(invoice: Invoice): InvoicePdfLineItem[] {
  return (invoice.items ?? []).map((item) => {
    const description = item.product.name || item.product.description || 'Item';
    const details =
      item.product.description != null &&
      item.product.description.length > 0 &&
      item.product.description !== description
        ? item.product.description
        : undefined;
    const taxLabel = formatTaxRateLabel(item.taxRateBasisPoints);
    const discountLabel =
      item.discountAmount.amountMinor > 0
        ? formatPdfMoney(item.discountAmount.amountMinor, invoice.currencyCode)
        : undefined;

    return {
      id: item.id,
      position: item.position,
      description,
      details,
      quantityLabel: String(item.quantity),
      unitLabel: getProductUnitLabel(item.product.unit),
      unitPriceLabel: formatPdfMoney(item.unitPrice.amountMinor, invoice.currencyCode),
      discountLabel,
      taxLabel,
      lineTotalLabel: formatPdfMoney(item.totalAmount.amountMinor, invoice.currencyCode),
    };
  });
}

export function buildInvoicePdfDocumentModel(input: {
  invoice: Invoice;
  business?: Business | null;
  logoDataUri?: string;
  signatureDataUri?: string;
}): InvoicePdfDocumentModel {
  const { invoice, business } = input;
  const status = resolveEffectiveStatus(invoice);
  const taxAmount = invoice.totals.taxAmount.amountMinor;
  const taxSummaryLabel =
    taxAmount > 0
      ? `Tax ${formatPdfMoney(taxAmount, invoice.currencyCode)}`
      : 'Tax included where applicable';

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    statusLabel: mapInvoiceStatus(status).toUpperCase(),
    issuedAtLabel: formatPdfDate(invoice.issuedAt),
    dueAtLabel: invoice.dueAt != null ? formatPdfDate(invoice.dueAt) : undefined,
    currencyCode: invoice.currencyCode,
    business: toPdfParty(invoice.business, {
      website: business?.website,
      logoDataUri: input.logoDataUri,
      signatureDataUri: input.signatureDataUri,
    }),
    customer: toPdfParty(invoice.customer),
    items: toPdfLineItems(invoice),
    totals: {
      subtotalLabel: formatPdfMoney(
        invoice.totals.subtotalAmount.amountMinor,
        invoice.currencyCode,
      ),
      discountLabel: formatPdfMoney(
        invoice.totals.discountAmount.amountMinor,
        invoice.currencyCode,
      ),
      taxLabel: formatPdfMoney(invoice.totals.taxAmount.amountMinor, invoice.currencyCode),
      roundOffLabel: formatPdfMoney(
        invoice.totals.roundOffAmount?.amountMinor ?? 0,
        invoice.currencyCode,
      ),
      grandTotalLabel: formatPdfMoney(invoice.totals.totalAmount.amountMinor, invoice.currencyCode),
      paidLabel:
        invoice.totals.paidAmount.amountMinor > 0
          ? formatPdfMoney(invoice.totals.paidAmount.amountMinor, invoice.currencyCode)
          : undefined,
      balanceLabel: formatPdfMoney(invoice.totals.balanceAmount.amountMinor, invoice.currencyCode),
    },
    notes: invoice.notes,
    terms: invoice.terms,
    taxSummaryLabel,
    footerText: `Generated for ${invoice.business.name || 'your business'} · ${invoice.invoiceNumber}`,
    contentFingerprint: '',
  };
}

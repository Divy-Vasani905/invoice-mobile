import {
  DiscountType,
  InvoiceCalculationEngine,
  type InvoiceCalculationResult,
  type InvoiceLineItemInput,
  type TaxDefinition,
} from '@/services/invoice/calculation';
import { InvoiceNumberGenerator } from '@/services/invoice/InvoiceNumberGenerator';
import {
  NO_TAX_SELECTION_ID,
  SNAPSHOT_TAX_SELECTION_ID,
} from '@/features/tax/utils/tax.utils';
import type { BadgeVariant } from '@/theme';
import {
  InvoiceStatus,
  ProductUnit,
  SyncStatus,
  DEFAULT_INVOICE_NUMBER_PADDING,
  DEFAULT_INVOICE_PREFIX,
  DEFAULT_NEXT_INVOICE_NUMBER,
  MAX_INVOICE_NUMBER_PADDING,
  MIN_INVOICE_NUMBER_PADDING,
  type Address,
  type AppSettings,
  type Business,
  type Customer,
  type Invoice,
  type InvoiceAppliedTax,
  type InvoiceItem,
  type InvoicePartySnapshot,
  type InvoiceTotals,
  type Money,
  type Product,
  type TaxCatalogSettings,
} from '@/types/models';

import type {
  InvoiceDisplayStatus,
  InvoiceFormItemValues,
  InvoiceFormValues,
  InvoiceListFilter,
  InvoiceNumberReservation,
} from '../types/invoice.types';

export { DEFAULT_INVOICE_NUMBER_PADDING, DEFAULT_INVOICE_PREFIX, DEFAULT_NEXT_INVOICE_NUMBER };
export const DEFAULT_PAYMENT_TERMS_DAYS = 30;

const calculationEngine = new InvoiceCalculationEngine();
const numberGenerator = new InvoiceNumberGenerator();

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function compactOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? '';
  return normalized.length > 0 ? normalized : undefined;
}

export function getCurrencyFractionDigits(currencyCode: string): number {
  return (
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
}

export function toMajorUnits(amountMinor: number, currencyCode: string): number {
  return amountMinor / 10 ** getCurrencyFractionDigits(currencyCode);
}

export function toMinorUnits(amountMajor: number, currencyCode: string): number {
  return Math.round(amountMajor * 10 ** getCurrencyFractionDigits(currencyCode));
}

export function formatMoney(amountMinor: number, currencyCode: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(toMajorUnits(amountMinor, currencyCode));
}

export function formatInvoiceDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function toDateInputValue(isoOrDate: string): string {
  const date = new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return isoOrDate.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateInputToIso(dateInput: string, endOfDay = false): string {
  const [year, month, day] = dateInput.split('-').map(Number);
  if (
    year == null ||
    month == null ||
    day == null ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return new Date().toISOString();
  }
  const date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.toISOString();
}

export function addDaysToDateInput(dateInput: string, days: number): string {
  const [year, month, day] = dateInput.split('-').map(Number);
  if (year == null || month == null || day == null) return dateInput;
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date.toISOString());
}

export function todayDateInput(): string {
  return toDateInputValue(new Date().toISOString());
}

export function parsePriceInput(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '');
  if (normalized.length === 0) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

export function parseQuantityInput(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '');
  if (normalized.length === 0) return null;
  const quantity = Number(normalized);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : null;
}

/** Form tax rate is a percentage string (e.g. "18"); stored as basis points. */
export function parseTaxRatePercentToBasisPoints(value: string): number | null {
  const normalized = value.trim();
  if (normalized.length === 0) return 0;
  const rate = Number(normalized);
  if (!Number.isFinite(rate) || rate < 0) return null;
  return Math.round(rate * 100);
}

export function basisPointsToPercentString(basisPoints: number): string {
  return basisPoints === 0 ? '' : String(basisPoints / 100);
}

export function mapInvoiceStatus(status: InvoiceStatus): InvoiceDisplayStatus {
  if (status === InvoiceStatus.Paid) return 'Paid';
  if (status === InvoiceStatus.Overdue) return 'Overdue';
  if (status === InvoiceStatus.Draft) return 'Draft';
  if (status === InvoiceStatus.Cancelled) return 'Cancelled';
  return 'Pending';
}

export function toBadgeVariant(status: InvoiceDisplayStatus): BadgeVariant {
  switch (status) {
    case 'Paid':
      return 'paid';
    case 'Pending':
      return 'pending';
    case 'Overdue':
      return 'overdue';
    case 'Draft':
      return 'draft';
    case 'Cancelled':
      return 'cancelled';
    default:
      return 'neutral';
  }
}

export function matchesListFilter(status: InvoiceStatus, filter: InvoiceListFilter): boolean {
  if (filter === 'all') return true;
  const display = mapInvoiceStatus(status);
  if (filter === 'paid') return display === 'Paid';
  if (filter === 'overdue') return display === 'Overdue';
  if (filter === 'draft') return display === 'Draft';
  return display === 'Pending';
}

export function resolveEffectiveStatus(invoice: Invoice, now = new Date()): InvoiceStatus {
  if (
    invoice.status === InvoiceStatus.Draft ||
    invoice.status === InvoiceStatus.Paid ||
    invoice.status === InvoiceStatus.Cancelled ||
    invoice.status === InvoiceStatus.PartiallyPaid
  ) {
    return invoice.status;
  }
  if (invoice.dueAt == null) return invoice.status;
  const due = new Date(invoice.dueAt);
  if (!Number.isNaN(due.getTime()) && due.getTime() < now.getTime()) {
    return InvoiceStatus.Overdue;
  }
  return invoice.status;
}

export function formatAddress(address?: Address): string {
  if (address == null) return '';
  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.countryCode,
  ]
    .filter((part) => part != null && part.length > 0)
    .join(', ');
}

export function toBusinessSnapshot(business: Business): InvoicePartySnapshot {
  return {
    name: business.displayName || business.legalName,
    email: business.email,
    phone: business.phone,
    address: business.address,
    taxId: business.taxId,
    logoUri: business.logoUri,
  };
}

export function toCustomerSnapshot(customer: Customer): InvoicePartySnapshot {
  return {
    name: customer.displayName,
    email: customer.email,
    phone: customer.phone,
    address: customer.billingAddress,
    taxId: customer.taxId,
    companyName: customer.companyName,
  };
}

export function emptyCustomerSnapshot(): InvoicePartySnapshot {
  return { name: '' };
}

export function createEmptyFormItem(_currencyCode?: string): InvoiceFormItemValues {
  return {
    id: createLocalId('item'),
    productId: '',
    name: '',
    description: '',
    unit: ProductUnit.Each,
    quantity: '1',
    unitPrice: '',
    taxRate: '',
    discount: '',
  };
}

export function productToFormItem(product: Product): InvoiceFormItemValues {
  return {
    id: createLocalId('item'),
    productId: product.id,
    name: product.name,
    description: product.description ?? '',
    unit: product.unit,
    quantity: '1',
    unitPrice: String(toMajorUnits(product.unitPrice.amountMinor, product.unitPrice.currencyCode)),
    taxRate: basisPointsToPercentString(product.taxRateBasisPoints),
    discount: '',
  };
}

export function invoiceItemToFormItem(item: InvoiceItem): InvoiceFormItemValues {
  return {
    id: item.id,
    productId: item.product.productId ?? '',
    name: item.product.name,
    description: item.product.description ?? '',
    unit: item.product.unit,
    quantity: String(item.quantity),
    unitPrice: String(toMajorUnits(item.unitPrice.amountMinor, item.unitPrice.currencyCode)),
    taxRate: basisPointsToPercentString(item.taxRateBasisPoints),
    discount:
      item.discountAmount.amountMinor === 0
        ? ''
        : String(toMajorUnits(item.discountAmount.amountMinor, item.discountAmount.currencyCode)),
  };
}

export function toInvoiceFormValues(
  invoice: Invoice,
  catalog?: TaxCatalogSettings,
): InvoiceFormValues {
  const taxFields = invoiceTaxToFormFields(invoice, catalog);
  return {
    invoiceNumber: invoice.invoiceNumber,
    customerId: invoice.customerId ?? '',
    customerName: invoice.customer.name,
    issuedAt: toDateInputValue(invoice.issuedAt),
    dueAt: invoice.dueAt != null ? toDateInputValue(invoice.dueAt) : '',
    currencyCode: invoice.currencyCode,
    notes: invoice.notes ?? '',
    items: (invoice.items ?? []).map(invoiceItemToFormItem),
    status: invoice.status,
    ...taxFields,
  };
}

export function invoiceTaxToFormFields(
  invoice: Invoice,
  catalog?: TaxCatalogSettings,
): Pick<
  InvoiceFormValues,
  'appliedTaxId' | 'appliedTaxName' | 'appliedTaxRateBasisPoints' | 'useLegacyItemTax'
> {
  if (invoice.appliedTax === null) {
    return {
      appliedTaxId: NO_TAX_SELECTION_ID,
      appliedTaxName: '',
      appliedTaxRateBasisPoints: 0,
      useLegacyItemTax: false,
    };
  }
  if (invoice.appliedTax != null) {
    const snapshot = invoice.appliedTax;
    const matchingCatalogTax = catalog?.taxes.find(
      (tax) =>
        tax.id === snapshot.taxId &&
        tax.name === snapshot.name &&
        tax.rateBasisPoints === snapshot.rateBasisPoints,
    );
    return {
      appliedTaxId: matchingCatalogTax?.id ?? SNAPSHOT_TAX_SELECTION_ID,
      appliedTaxName: snapshot.name,
      appliedTaxRateBasisPoints: snapshot.rateBasisPoints,
      useLegacyItemTax: false,
    };
  }
  return {
    appliedTaxId: NO_TAX_SELECTION_ID,
    appliedTaxName: '',
    appliedTaxRateBasisPoints: 0,
    useLegacyItemTax: true,
  };
}

export function resolveFormTaxDefinition(
  values: Pick<
    InvoiceFormValues,
    'appliedTaxId' | 'appliedTaxName' | 'appliedTaxRateBasisPoints' | 'useLegacyItemTax'
  >,
): TaxDefinition | null {
  if (values.useLegacyItemTax) return null;
  if (values.appliedTaxId === NO_TAX_SELECTION_ID) return null;
  const name = values.appliedTaxName.trim() || 'Tax';
  return {
    id: values.appliedTaxId === SNAPSHOT_TAX_SELECTION_ID ? 'invoice-tax' : values.appliedTaxId,
    name,
    rateBasisPoints: values.appliedTaxRateBasisPoints,
  };
}

export function buildAppliedTaxSnapshot(
  values: InvoiceFormValues,
  taxAmountMinor: number,
  currencyCode: string,
): InvoiceAppliedTax | null | undefined {
  if (values.useLegacyItemTax) return undefined;
  const definition = resolveFormTaxDefinition(values);
  if (definition == null) return null;
  return {
    taxId:
      values.appliedTaxId === SNAPSHOT_TAX_SELECTION_ID || values.appliedTaxId === NO_TAX_SELECTION_ID
        ? undefined
        : values.appliedTaxId,
    name: definition.name,
    rateBasisPoints: definition.rateBasisPoints,
    amount: money(taxAmountMinor, currencyCode),
  };
}

export function resolveInvoiceNumberingConfig(settings: AppSettings | null): {
  prefix: string;
  nextNumber: number;
  paddingLength: number;
} {
  const storedNext = settings?.invoice.nextInvoiceNumber;
  const storedPadding = settings?.invoice.invoiceNumberPadding;
  const nextNumber =
    storedNext != null && Number.isSafeInteger(storedNext) && storedNext >= 1
      ? storedNext
      : DEFAULT_NEXT_INVOICE_NUMBER;
  const paddingLength =
    storedPadding != null &&
    Number.isSafeInteger(storedPadding) &&
    storedPadding >= MIN_INVOICE_NUMBER_PADDING &&
    storedPadding <= MAX_INVOICE_NUMBER_PADDING
      ? storedPadding
      : DEFAULT_INVOICE_NUMBER_PADDING;

  return {
    prefix: settings?.invoice.invoiceNumberPrefix?.trim() || DEFAULT_INVOICE_PREFIX,
    nextNumber,
    paddingLength,
  };
}

export function formatInvoiceNumberPreview(config: {
  prefix: string;
  nextNumber: number;
  paddingLength: number;
}): string {
  return numberGenerator.format(config);
}

export function collectInvoiceNumbers(invoices: { invoiceNumber: string }[]): ReadonlySet<string> {
  return new Set(invoices.map((invoice) => invoice.invoiceNumber));
}

/**
 * Peeks the next unique formatted invoice number without persisting state.
 * Persist `reservation.nextNumber` only after the invoice is saved.
 */
export function peekNextAvailableInvoiceNumber(
  settings: AppSettings | null,
  existingNumbers: ReadonlySet<string>,
): InvoiceNumberReservation {
  const config = resolveInvoiceNumberingConfig(settings);
  const generation = numberGenerator.findNextAvailable(config, existingNumbers);
  return {
    invoiceNumber: generation.invoiceNumber,
    sequenceNumber: generation.sequenceNumber,
    nextNumber: generation.nextNumber,
    prefix: config.prefix,
    paddingLength: config.paddingLength,
  };
}

/**
 * After importing invoices, persist this sequence as `nextInvoiceNumber`
 * (the next number to assign), not `reservation.nextNumber`.
 */
export function nextSequenceAfterImport(
  settings: AppSettings | null,
  existingNumbers: ReadonlySet<string>,
): number {
  return peekNextAvailableInvoiceNumber(settings, existingNumbers).sequenceNumber;
}

export function isFormattedInvoiceNumberTaken(
  settings: AppSettings | null,
  existingNumbers: ReadonlySet<string>,
): boolean {
  const config = resolveInvoiceNumberingConfig(settings);
  try {
    const formatted = numberGenerator.format(config);
    return existingNumbers.has(formatted);
  } catch {
    return false;
  }
}

export function money(amountMinor: number, currencyCode: string): Money {
  return { amountMinor, currencyCode };
}

export function emptyTotals(currencyCode: string): InvoiceTotals {
  const zero = money(0, currencyCode);
  return {
    subtotalAmount: zero,
    discountAmount: zero,
    taxAmount: zero,
    roundOffAmount: zero,
    totalAmount: zero,
    paidAmount: zero,
    balanceAmount: zero,
  };
}

export function formItemsToCalculationInput(
  items: InvoiceFormItemValues[],
  currencyCode: string,
  options?: { ignoreItemTaxes?: boolean },
): { inputs: InvoiceLineItemInput[]; precision: number } | null {
  const precision = getCurrencyFractionDigits(currencyCode);
  const inputs: InvoiceLineItemInput[] = [];
  const ignoreItemTaxes = options?.ignoreItemTaxes === true;

  for (const item of items) {
    const quantity = parseQuantityInput(item.quantity);
    const unitPriceMajor = parsePriceInput(item.unitPrice);
    const taxBps = ignoreItemTaxes ? 0 : parseTaxRatePercentToBasisPoints(item.taxRate);
    const discountMajor = item.discount.trim().length === 0 ? 0 : parsePriceInput(item.discount);

    if (quantity == null || unitPriceMajor == null || taxBps == null || discountMajor == null) {
      return null;
    }

    const discount =
      discountMajor === 0
        ? { type: DiscountType.None as const }
        : {
            type: DiscountType.FixedAmount as const,
            amountMinor: toMinorUnits(discountMajor, currencyCode),
          };

    inputs.push({
      id: item.id,
      unitPriceMinor: toMinorUnits(unitPriceMajor, currencyCode),
      quantity,
      discount,
      taxes:
        taxBps > 0 ? [{ id: `tax-${item.id}`, name: 'Tax', rateBasisPoints: taxBps }] : undefined,
    });
  }

  return { inputs, precision };
}

export function calculateFormTotals(
  items: InvoiceFormItemValues[],
  currencyCode: string,
  taxForm?: Pick<
    InvoiceFormValues,
    'appliedTaxId' | 'appliedTaxName' | 'appliedTaxRateBasisPoints' | 'useLegacyItemTax'
  >,
): InvoiceCalculationResult | null {
  if (items.length === 0) {
    return {
      currencyPrecision: getCurrencyFractionDigits(currencyCode),
      subtotalMinor: 0,
      discountTotalMinor: 0,
      taxTotalMinor: 0,
      preRoundingTotalMinor: 0,
      roundOffMinor: 0,
      grandTotalMinor: 0,
      itemTotals: [],
      taxTotals: [],
    };
  }

  const useLegacy = taxForm?.useLegacyItemTax === true;
  const invoiceTax = taxForm == null || useLegacy ? null : resolveFormTaxDefinition(taxForm);

  const prepared = formItemsToCalculationInput(items, currencyCode, {
    ignoreItemTaxes: !useLegacy && taxForm != null,
  });
  if (prepared == null) return null;

  return calculationEngine.calculateInvoice({
    items: prepared.inputs,
    currencyPrecision: prepared.precision,
    invoiceTaxes: invoiceTax == null ? undefined : [invoiceTax],
  });
}

export function buildInvoiceItems(
  invoiceId: string,
  formItems: InvoiceFormItemValues[],
  currencyCode: string,
  calculation: InvoiceCalculationResult,
  timestamp: string,
): InvoiceItem[] {
  return formItems.map((formItem, index) => {
    const line = calculation.itemTotals.find((entry) => entry.itemId === formItem.id);
    const quantity = parseQuantityInput(formItem.quantity) ?? 0;
    const unitPriceMajor = parsePriceInput(formItem.unitPrice) ?? 0;
    const taxBps = parseTaxRatePercentToBasisPoints(formItem.taxRate) ?? 0;
    const discountMajor =
      formItem.discount.trim().length === 0 ? 0 : (parsePriceInput(formItem.discount) ?? 0);
    const unit = Object.values(ProductUnit).includes(formItem.unit as ProductUnit)
      ? (formItem.unit as ProductUnit)
      : ProductUnit.Each;

    return {
      id: formItem.id,
      invoiceId,
      position: index,
      product: {
        productId: compactOptional(formItem.productId),
        name: formItem.name.trim() || formItem.description.trim() || 'Item',
        description: compactOptional(formItem.description),
        unit,
      },
      quantity,
      unitPrice: money(toMinorUnits(unitPriceMajor, currencyCode), currencyCode),
      discountAmount: money(toMinorUnits(discountMajor, currencyCode), currencyCode),
      taxRateBasisPoints: taxBps,
      subtotalAmount: money(line?.subtotalMinor ?? 0, currencyCode),
      taxAmount: money(line?.taxMinor ?? 0, currencyCode),
      totalAmount: money(line?.totalMinor ?? 0, currencyCode),
      createdAt: timestamp,
      updatedAt: timestamp,
      localRevision: 1,
      syncStatus: SyncStatus.Pending,
    };
  });
}

export function buildTotalsFromCalculation(
  calculation: InvoiceCalculationResult,
  currencyCode: string,
  status: InvoiceStatus,
): InvoiceTotals {
  const total = money(calculation.grandTotalMinor, currencyCode);
  const paid = status === InvoiceStatus.Paid ? total : money(0, currencyCode);
  return {
    subtotalAmount: money(calculation.subtotalMinor, currencyCode),
    discountAmount: money(calculation.discountTotalMinor, currencyCode),
    taxAmount: money(calculation.taxTotalMinor, currencyCode),
    roundOffAmount: money(calculation.roundOffMinor, currencyCode),
    totalAmount: total,
    paidAmount: paid,
    balanceAmount: money(total.amountMinor - paid.amountMinor, currencyCode),
  };
}

export function normalizeInvoice(invoice: Invoice): Invoice {
  const currencyCode = invoice.currencyCode;
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const totals = invoice.totals ?? emptyTotals(currencyCode);
  return {
    ...invoice,
    items,
    totals: {
      ...emptyTotals(currencyCode),
      ...totals,
      roundOffAmount: totals.roundOffAmount ?? money(0, currencyCode),
    },
  };
}

export function getProductUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    [ProductUnit.Each]: 'Unit',
    [ProductUnit.Piece]: 'Piece',
    [ProductUnit.Hour]: 'Hour',
    [ProductUnit.Day]: 'Day',
    [ProductUnit.Week]: 'Week',
    [ProductUnit.Month]: 'Month',
    [ProductUnit.Project]: 'Project',
    [ProductUnit.Kilogram]: 'Kg',
    [ProductUnit.Gram]: 'Gram',
    [ProductUnit.Litre]: 'Litre',
    [ProductUnit.Metre]: 'Metre',
  };
  return labels[unit] ?? unit;
}

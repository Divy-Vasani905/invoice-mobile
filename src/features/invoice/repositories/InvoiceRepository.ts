import { businessFeatureRepository } from '@/features/business/repositories/BusinessRepository';
import { customerFeatureRepository } from '@/features/customer/repositories/CustomerRepository';
import { taxSettingsRepository } from '@/features/tax/repositories/TaxSettingsRepository';
import { NO_TAX_SELECTION_ID } from '@/features/tax/utils/tax.utils';
import {
  invoiceRepository,
  settingsRepository,
  type InvoiceRepository as InvoiceStorageRepository,
  type SettingsRepository,
} from '@/storage';
import { getPreferredCurrencyCode } from '@/stores/user-preferences';
import {
  InvoiceNumberingMode,
  InvoiceStatus,
  ProductUnit,
  SyncStatus,
  ThemePreference,
  DEFAULT_INVOICE_NUMBER_PADDING,
  DEFAULT_INVOICE_PREFIX,
  DEFAULT_NEXT_INVOICE_NUMBER,
  DEFAULT_TAX_CATALOG,
  type AppSettings,
  type Invoice,
} from '@/types/models';

import {
  DEFAULT_PAYMENT_TERMS_DAYS,
  addDaysToDateInput,
  buildAppliedTaxSnapshot,
  buildInvoiceItems,
  buildTotalsFromCalculation,
  calculateFormTotals,
  compactOptional,
  collectInvoiceNumbers,
  createLocalId,
  dateInputToIso,
  emptyCustomerSnapshot,
  emptyTotals,
  formatInvoiceDate,
  formatInvoiceNumberPreview,
  formatMoney,
  isFormattedInvoiceNumberTaken,
  mapInvoiceStatus,
  matchesListFilter,
  normalizeInvoice,
  peekNextAvailableInvoiceNumber,
  resolveEffectiveStatus,
  resolveInvoiceNumberingConfig,
  toBadgeVariant,
  toBusinessSnapshot,
  toCustomerSnapshot,
  toInvoiceFormValues,
  todayDateInput,
} from '../utils/invoice.utils';

import type { InvoiceFormValues, InvoiceListFilter, InvoiceListItem } from '../types/invoice.types';

export class MissingBusinessError extends Error {
  public constructor() {
    super('Add a business profile before creating invoices.');
    this.name = 'MissingBusinessError';
  }
}

export class InvoiceNotFoundError extends Error {
  public constructor() {
    super('Invoice not found.');
    this.name = 'InvoiceNotFoundError';
  }
}

export class InvoiceValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'InvoiceValidationError';
  }
}

export class DuplicateInvoiceNumberError extends InvoiceValidationError {
  public constructor() {
    super('That invoice number is already in use. A unique number will be assigned on save.');
    this.name = 'DuplicateInvoiceNumberError';
  }
}

/** Feature adapter over MMKV invoice storage with calculation + numbering. */
export class InvoiceRepository {
  private persistLock = false;

  public constructor(
    private readonly invoices: InvoiceStorageRepository = invoiceRepository,
    private readonly settings: SettingsRepository = settingsRepository,
  ) {}

  public getInvoices(): InvoiceListItem[] {
    return this.invoices
      .getAll()
      .map((invoice) => normalizeInvoice(invoice))
      .map((invoice) => this.toListItem(invoice))
      .sort((left, right) => right.invoice.issuedAt.localeCompare(left.invoice.issuedAt));
  }

  public getInvoiceById(invoiceId: string): Invoice | null {
    const invoice = this.invoices.getById(invoiceId);
    return invoice == null ? null : normalizeInvoice(invoice);
  }

  public filterInvoices(
    invoices: InvoiceListItem[],
    searchQuery: string,
    filter: InvoiceListFilter,
  ): InvoiceListItem[] {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    return invoices.filter((item) => {
      const status = resolveEffectiveStatus(item.invoice);
      if (!matchesListFilter(status, filter)) return false;
      if (normalizedQuery.length === 0) return true;
      return [
        item.invoice.invoiceNumber,
        item.customerName,
        item.invoice.business.name,
        item.invoice.notes,
      ].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery));
    });
  }

  public getDefaultCreateFormValues(): InvoiceFormValues {
    const business = businessFeatureRepository.getActiveBusiness();
    if (business == null) throw new MissingBusinessError();

    const settings = this.ensureSettings(business.id);
    const reservation = this.allocateNextNumber(settings);
    const issuedAt = todayDateInput();
    const dueAt = addDaysToDateInput(
      issuedAt,
      settings.invoice.defaultPaymentTermsDays ?? DEFAULT_PAYMENT_TERMS_DAYS,
    );

    const catalog = taxSettingsRepository.getCatalog();
    const defaultTax =
      catalog.enabled && catalog.defaultTaxId != null
        ? (catalog.taxes.find((tax) => tax.id === catalog.defaultTaxId) ?? null)
        : null;

    return {
      invoiceNumber: reservation.invoiceNumber,
      customerId: '',
      customerName: '',
      issuedAt,
      dueAt,
      currencyCode: getPreferredCurrencyCode(),
      notes: business.defaultInvoiceNotes ?? '',
      items: [],
      status: InvoiceStatus.Draft,
      appliedTaxId: defaultTax == null ? NO_TAX_SELECTION_ID : defaultTax.id,
      appliedTaxName: defaultTax?.name ?? '',
      appliedTaxRateBasisPoints: defaultTax?.rateBasisPoints ?? 0,
      useLegacyItemTax: false,
    };
  }

  public createInvoice(values: InvoiceFormValues, asDraft: boolean): Invoice {
    return this.withPersistLock(() => {
      const business = businessFeatureRepository.getActiveBusiness();
      if (business == null) throw new MissingBusinessError();

      const settings = this.ensureSettings(business.id);
      const reservation = this.allocateNextNumber(settings);
      const timestamp = new Date().toISOString();
      const status = asDraft ? InvoiceStatus.Draft : InvoiceStatus.Issued;
      const invoiceId = createLocalId('invoice');
      const invoice = this.buildInvoiceRecord({
        id: invoiceId,
        values: { ...values, invoiceNumber: reservation.invoiceNumber },
        businessId: business.id,
        businessSnapshot: toBusinessSnapshot(business),
        status,
        createdAt: timestamp,
        updatedAt: timestamp,
        localRevision: 1,
        asDraft,
      });

      this.assertInvoiceNumberUnused(invoice.invoiceNumber);
      this.invoices.create(invoice);
      this.persistNextInvoiceNumber(settings, reservation.nextNumber);
      return invoice;
    });
  }

  public updateInvoice(invoiceId: string, values: InvoiceFormValues, asDraft: boolean): Invoice {
    const current = this.requireInvoice(invoiceId);
    const business = businessFeatureRepository.getActiveBusiness();
    if (business == null) throw new MissingBusinessError();

    const timestamp = new Date().toISOString();
    let status = asDraft ? InvoiceStatus.Draft : InvoiceStatus.Issued;
    if (!asDraft && current.status === InvoiceStatus.Paid) {
      status = InvoiceStatus.Paid;
    }

    const invoice = this.buildInvoiceRecord({
      id: current.id,
      values: {
        ...values,
        invoiceNumber: current.invoiceNumber,
        currencyCode: current.currencyCode,
      },
      businessId: current.businessId,
      businessSnapshot: current.business.name ? current.business : toBusinessSnapshot(business),
      status,
      createdAt: current.createdAt,
      updatedAt: timestamp,
      localRevision: current.localRevision + 1,
      asDraft,
      existingPaidAmount: current.totals.paidAmount.amountMinor,
    });

    this.invoices.update(invoice);
    return invoice;
  }

  public deleteInvoice(invoiceId: string): void {
    this.requireInvoice(invoiceId);
    this.invoices.delete(invoiceId);
  }

  public duplicateInvoice(invoiceId: string): Invoice {
    return this.withPersistLock(() => {
      const source = this.requireInvoice(invoiceId);
      const business = businessFeatureRepository.getActiveBusiness();
      if (business == null) throw new MissingBusinessError();

      const settings = this.ensureSettings(business.id);
      const reservation = this.allocateNextNumber(settings);
      const timestamp = new Date().toISOString();
      const formValues = toInvoiceFormValues(source, taxSettingsRepository.getCatalog());
      const invoiceIdNew = createLocalId('invoice');

      const duplicatedItems = formValues.items.map((item) => ({
        ...item,
        id: createLocalId('item'),
      }));

      const invoice = this.buildInvoiceRecord({
        id: invoiceIdNew,
        values: {
          ...formValues,
          invoiceNumber: reservation.invoiceNumber,
          issuedAt: todayDateInput(),
          dueAt:
            formValues.dueAt || addDaysToDateInput(todayDateInput(), DEFAULT_PAYMENT_TERMS_DAYS),
          items: duplicatedItems,
          status: InvoiceStatus.Draft,
          notes: formValues.notes,
          currencyCode: source.currencyCode,
        },
        businessId: source.businessId,
        businessSnapshot: source.business,
        status: InvoiceStatus.Draft,
        createdAt: timestamp,
        updatedAt: timestamp,
        localRevision: 1,
        asDraft: true,
      });

      this.assertInvoiceNumberUnused(invoice.invoiceNumber);
      this.invoices.create(invoice);
      this.persistNextInvoiceNumber(settings, reservation.nextNumber);
      return invoice;
    });
  }

  public markInvoicePaid(invoiceId: string): Invoice {
    const current = this.requireInvoice(invoiceId);
    const invoice: Invoice = {
      ...current,
      status: InvoiceStatus.Paid,
      totals: {
        ...current.totals,
        paidAmount: current.totals.totalAmount,
        balanceAmount: {
          amountMinor: 0,
          currencyCode: current.currencyCode,
        },
      },
      updatedAt: new Date().toISOString(),
      localRevision: current.localRevision + 1,
      syncStatus: SyncStatus.Pending,
    };
    this.invoices.update(invoice);
    return invoice;
  }

  private toListItem(invoice: Invoice): InvoiceListItem {
    const status = resolveEffectiveStatus(invoice);
    const displayStatus = mapInvoiceStatus(status);
    return {
      invoice: { ...invoice, status },
      displayStatus,
      badgeVariant: toBadgeVariant(displayStatus),
      formattedAmount: formatMoney(invoice.totals.totalAmount.amountMinor, invoice.currencyCode),
      formattedDate: formatInvoiceDate(invoice.issuedAt),
      customerName: invoice.customer.name || 'No customer',
    };
  }

  private buildInvoiceRecord(input: {
    id: string;
    values: InvoiceFormValues;
    businessId: string;
    businessSnapshot: Invoice['business'];
    status: InvoiceStatus;
    createdAt: string;
    updatedAt: string;
    localRevision: number;
    asDraft: boolean;
    existingPaidAmount?: number;
  }): Invoice {
    const { values, asDraft } = input;
    const currencyCode = values.currencyCode;
    const persistItems = values.useLegacyItemTax
      ? values.items
      : values.items.map((item) => ({ ...item, taxRate: '' }));

    if (!asDraft) {
      if (values.customerId.trim().length === 0) {
        throw new InvoiceValidationError('Select a customer before saving the invoice.');
      }
      if (values.items.length === 0) {
        throw new InvoiceValidationError('Add at least one item before saving the invoice.');
      }
    }

    const calculation = calculateFormTotals(persistItems, currencyCode, values);
    if (!asDraft && calculation == null) {
      throw new InvoiceValidationError(
        'Invoice totals could not be calculated. Check item values.',
      );
    }

    // Drafts may include incomplete lines; persist them with best-effort totals.
    const calculableItems =
      calculation == null
        ? persistItems.filter((item) => calculateFormTotals([item], currencyCode, values) != null)
        : persistItems;
    const safeCalculation = calculation ??
      calculateFormTotals(calculableItems, currencyCode, values) ?? {
        currencyPrecision: 2,
        subtotalMinor: 0,
        discountTotalMinor: 0,
        taxTotalMinor: 0,
        preRoundingTotalMinor: 0,
        roundOffMinor: 0,
        grandTotalMinor: 0,
        itemTotals: [],
        taxTotals: [],
      };

    const customer =
      values.customerId.trim().length > 0
        ? customerFeatureRepository.getCustomerById(values.customerId)
        : null;

    if (!asDraft && customer == null) {
      throw new InvoiceValidationError('Selected customer could not be found.');
    }

    const items = buildInvoiceItems(
      input.id,
      persistItems,
      currencyCode,
      safeCalculation,
      input.updatedAt,
    );

    let totals = buildTotalsFromCalculation(safeCalculation, currencyCode, input.status);
    if (input.status === InvoiceStatus.Paid || (input.existingPaidAmount ?? 0) > 0) {
      const paidMinor =
        input.status === InvoiceStatus.Paid
          ? totals.totalAmount.amountMinor
          : Math.min(input.existingPaidAmount ?? 0, totals.totalAmount.amountMinor);
      totals = {
        ...totals,
        paidAmount: { amountMinor: paidMinor, currencyCode },
        balanceAmount: {
          amountMinor: totals.totalAmount.amountMinor - paidMinor,
          currencyCode,
        },
      };
    }

    return {
      id: input.id,
      businessId: input.businessId,
      customerId: compactOptional(values.customerId),
      invoiceNumber: values.invoiceNumber.trim(),
      status: input.status,
      issuedAt: dateInputToIso(values.issuedAt),
      dueAt: compactOptional(values.dueAt) ? dateInputToIso(values.dueAt, true) : undefined,
      currencyCode,
      business: input.businessSnapshot,
      customer: customer != null ? toCustomerSnapshot(customer) : emptyCustomerSnapshot(),
      items,
      totals: persistItems.length === 0 ? emptyTotals(currencyCode) : totals,
      appliedTax: buildAppliedTaxSnapshot(values, safeCalculation.taxTotalMinor, currencyCode),
      notes: compactOptional(values.notes),
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      localRevision: input.localRevision,
      syncStatus: SyncStatus.Pending,
    };
  }

  public getInvoiceNumberFormat(): {
    prefix: string;
    nextNumber: number;
    padding: number;
    preview: string;
    configuredNumberTaken: boolean;
    nextAvailableNumber: string;
  } {
    const settings = this.settings.get();
    const config = resolveInvoiceNumberingConfig(settings);
    const existingNumbers = this.collectExistingNumbers();
    let preview = `${config.prefix}${String(config.nextNumber)}`;
    try {
      preview = formatInvoiceNumberPreview(config);
    } catch {
      // Invalid stored values fall back to an unpadded preview string.
    }

    let nextAvailableNumber = preview;
    try {
      nextAvailableNumber = peekNextAvailableInvoiceNumber(settings, existingNumbers).invoiceNumber;
    } catch {
      nextAvailableNumber = preview;
    }
    return {
      prefix: config.prefix,
      nextNumber: config.nextNumber,
      padding: config.paddingLength,
      preview,
      configuredNumberTaken: isFormattedInvoiceNumberTaken(settings, existingNumbers),
      nextAvailableNumber,
    };
  }

  public updateInvoiceNumberFormat(input: {
    prefix: string;
    nextNumber: number;
    padding: number;
  }): {
    preview: string;
    configuredNumberTaken: boolean;
    nextAvailableNumber: string;
  } {
    const settings = this.ensureSettings(this.resolveBusinessId());
    const prefix = input.prefix.trim();
    const updated: AppSettings = {
      ...settings,
      invoice: {
        ...settings.invoice,
        invoiceNumberingMode: InvoiceNumberingMode.Automatic,
        invoiceNumberPrefix: prefix,
        nextInvoiceNumber: input.nextNumber,
        invoiceNumberPadding: input.padding,
      },
      updatedAt: new Date().toISOString(),
      localRevision: settings.localRevision + 1,
      syncStatus: SyncStatus.Pending,
    };
    this.settings.update(updated);
    return this.getInvoiceNumberFormat();
  }

  /**
   * Recalculates `nextInvoiceNumber` so the next create cannot collide with
   * imported or otherwise inserted invoice numbers. Persist the returned
   * sequence as the next number to assign (not sequence + 1).
   */
  public syncNumberingAfterImport(): string {
    const settings = this.ensureSettings(this.resolveBusinessId());
    const reservation = this.allocateNextNumber(settings);
    this.persistNextInvoiceNumber(settings, reservation.sequenceNumber);
    return reservation.invoiceNumber;
  }

  private withPersistLock<T>(operation: () => T): T {
    if (this.persistLock) {
      throw new InvoiceValidationError('Please wait for the previous invoice to finish saving.');
    }
    this.persistLock = true;
    try {
      return operation();
    } finally {
      this.persistLock = false;
    }
  }

  private collectExistingNumbers(): ReadonlySet<string> {
    return collectInvoiceNumbers(this.invoices.getAll());
  }

  private allocateNextNumber(settings: AppSettings) {
    try {
      return peekNextAvailableInvoiceNumber(settings, this.collectExistingNumbers());
    } catch (error) {
      if (error instanceof RangeError) {
        throw new InvoiceValidationError(error.message);
      }
      throw error;
    }
  }

  private assertInvoiceNumberUnused(invoiceNumber: string): void {
    if (this.invoices.getAll().some((invoice) => invoice.invoiceNumber === invoiceNumber)) {
      throw new DuplicateInvoiceNumberError();
    }
  }

  private resolveBusinessId(): string {
    return businessFeatureRepository.getActiveBusiness()?.id ?? 'local-business';
  }

  private ensureSettings(businessId: string): AppSettings {
    const existing = this.settings.get();
    if (existing != null) return existing;

    const timestamp = new Date().toISOString();
    const created: AppSettings = {
      id: createLocalId('settings'),
      businessId,
      themePreference: ThemePreference.System,
      locale: 'en',
      invoice: {
        invoiceNumberingMode: InvoiceNumberingMode.Automatic,
        invoiceNumberPrefix: DEFAULT_INVOICE_PREFIX,
        nextInvoiceNumber: DEFAULT_NEXT_INVOICE_NUMBER,
        invoiceNumberPadding: DEFAULT_INVOICE_NUMBER_PADDING,
        defaultPaymentTermsDays: DEFAULT_PAYMENT_TERMS_DAYS,
        defaultTaxRateBasisPoints: 0,
        defaultProductUnit: ProductUnit.Each,
        selectedPdfTemplateId: 'classic',
        taxCatalog: DEFAULT_TAX_CATALOG,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      localRevision: 1,
      syncStatus: SyncStatus.Pending,
    };
    this.settings.update(created);
    return created;
  }

  private persistNextInvoiceNumber(settings: AppSettings, nextNumber: number): void {
    this.settings.update({
      ...settings,
      invoice: {
        ...settings.invoice,
        nextInvoiceNumber: nextNumber,
      },
      updatedAt: new Date().toISOString(),
      localRevision: settings.localRevision + 1,
      syncStatus: SyncStatus.Pending,
    });
  }

  private requireInvoice(invoiceId: string): Invoice {
    const invoice = this.getInvoiceById(invoiceId);
    if (invoice == null) throw new InvoiceNotFoundError();
    return invoice;
  }
}

export const invoiceFeatureRepository = new InvoiceRepository();

import { settingsRepository, type SettingsRepository } from '@/storage';
import {
  InvoiceNumberingMode,
  ProductUnit,
  SyncStatus,
  ThemePreference,
  DEFAULT_INVOICE_NUMBER_PADDING,
  DEFAULT_INVOICE_PREFIX,
  DEFAULT_NEXT_INVOICE_NUMBER,
  DEFAULT_TAX_CATALOG,
  type AppSettings,
  type SavedTaxRate,
  type TaxCatalogSettings,
} from '@/types/models';

import { findDuplicateTax, normalizeTaxName, resolveTaxCatalog } from '../utils/tax.utils';

export class TaxDuplicateError extends Error {
  public constructor() {
    super('This tax already exists.');
    this.name = 'TaxDuplicateError';
  }
}

export class TaxNotFoundError extends Error {
  public constructor() {
    super('Tax not found.');
    this.name = 'TaxNotFoundError';
  }
}

export class TaxSettingsRepository {
  public constructor(private readonly settings: SettingsRepository = settingsRepository) {}

  public getCatalog(): TaxCatalogSettings {
    return resolveTaxCatalog(this.settings.get()?.invoice.taxCatalog);
  }

  public setEnabled(enabled: boolean): TaxCatalogSettings {
    const catalog = this.getCatalog();
    return this.persistCatalog({ ...catalog, enabled });
  }

  public addTax(input: {
    name: string;
    rateBasisPoints: number;
    setAsDefault: boolean;
  }): SavedTaxRate {
    const catalog = this.getCatalog();
    const name = normalizeTaxName(input.name);
    if (findDuplicateTax(catalog.taxes, name, input.rateBasisPoints) != null) {
      throw new TaxDuplicateError();
    }

    const timestamp = new Date().toISOString();
    const tax: SavedTaxRate = {
      id: `tax-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      name,
      rateBasisPoints: input.rateBasisPoints,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const taxes = [...catalog.taxes, tax];
    this.persistCatalog({
      ...catalog,
      taxes,
      defaultTaxId: input.setAsDefault ? tax.id : catalog.defaultTaxId,
    });
    return tax;
  }

  public updateTax(input: {
    id: string;
    name: string;
    rateBasisPoints: number;
    setAsDefault: boolean;
  }): SavedTaxRate {
    const catalog = this.getCatalog();
    const current = catalog.taxes.find((tax) => tax.id === input.id);
    if (current == null) throw new TaxNotFoundError();

    const name = normalizeTaxName(input.name);
    if (findDuplicateTax(catalog.taxes, name, input.rateBasisPoints, input.id) != null) {
      throw new TaxDuplicateError();
    }

    const updated: SavedTaxRate = {
      ...current,
      name,
      rateBasisPoints: input.rateBasisPoints,
      updatedAt: new Date().toISOString(),
    };
    const taxes = catalog.taxes.map((tax) => (tax.id === input.id ? updated : tax));
    let defaultTaxId = catalog.defaultTaxId;
    if (input.setAsDefault) {
      defaultTaxId = updated.id;
    } else if (catalog.defaultTaxId === updated.id) {
      defaultTaxId = undefined;
    }

    this.persistCatalog({ ...catalog, taxes, defaultTaxId });
    return updated;
  }

  public setDefaultTaxId(taxId: string | undefined): TaxCatalogSettings {
    const catalog = this.getCatalog();
    if (taxId != null && !catalog.taxes.some((tax) => tax.id === taxId)) {
      throw new TaxNotFoundError();
    }
    return this.persistCatalog({ ...catalog, defaultTaxId: taxId });
  }

  public deleteTax(taxId: string): TaxCatalogSettings {
    const catalog = this.getCatalog();
    if (!catalog.taxes.some((tax) => tax.id === taxId)) {
      throw new TaxNotFoundError();
    }
    const taxes = catalog.taxes.filter((tax) => tax.id !== taxId);
    const defaultTaxId = catalog.defaultTaxId === taxId ? undefined : catalog.defaultTaxId;
    return this.persistCatalog({ ...catalog, taxes, defaultTaxId });
  }

  public getTaxById(taxId: string): SavedTaxRate | null {
    return this.getCatalog().taxes.find((tax) => tax.id === taxId) ?? null;
  }

  private persistCatalog(catalog: TaxCatalogSettings): TaxCatalogSettings {
    const settings = this.ensureSettings();
    this.settings.update({
      ...settings,
      invoice: {
        ...settings.invoice,
        taxCatalog: catalog,
      },
      updatedAt: new Date().toISOString(),
      localRevision: settings.localRevision + 1,
      syncStatus: SyncStatus.Pending,
    });
    return catalog;
  }

  private ensureSettings(): AppSettings {
    const existing = this.settings.get();
    if (existing != null) {
      if (existing.invoice.taxCatalog != null) return existing;
      const withCatalog: AppSettings = {
        ...existing,
        invoice: {
          ...existing.invoice,
          taxCatalog: DEFAULT_TAX_CATALOG,
        },
      };
      this.settings.update(withCatalog);
      return withCatalog;
    }

    const timestamp = new Date().toISOString();
    const created: AppSettings = {
      id: `settings-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      businessId: 'local-business',
      themePreference: ThemePreference.System,
      locale: 'en',
      invoice: {
        invoiceNumberingMode: InvoiceNumberingMode.Automatic,
        invoiceNumberPrefix: DEFAULT_INVOICE_PREFIX,
        nextInvoiceNumber: DEFAULT_NEXT_INVOICE_NUMBER,
        invoiceNumberPadding: DEFAULT_INVOICE_NUMBER_PADDING,
        defaultPaymentTermsDays: 30,
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
}

export const taxSettingsRepository = new TaxSettingsRepository();

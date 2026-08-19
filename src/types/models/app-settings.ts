import type { OfflineEntity } from '@/types/models/common';
import type { ProductUnit } from '@/types/models/product';

export enum ThemePreference {
  System = 'system',
  Light = 'light',
  Dark = 'dark',
}

export enum InvoiceNumberingMode {
  Automatic = 'automatic',
  Manual = 'manual',
}

export const DEFAULT_INVOICE_PREFIX = 'INV-';
export const DEFAULT_NEXT_INVOICE_NUMBER = 1001;
export const DEFAULT_INVOICE_NUMBER_PADDING = 4;
export const MIN_INVOICE_NUMBER_PADDING = 1;
export const MAX_INVOICE_NUMBER_PADDING = 10;

export interface SavedTaxRate {
  id: string;
  name: string;
  rateBasisPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaxCatalogSettings {
  enabled: boolean;
  defaultTaxId?: string;
  taxes: SavedTaxRate[];
}

export const DEFAULT_TAX_CATALOG: TaxCatalogSettings = {
  enabled: true,
  taxes: [],
};

export interface InvoiceSettings {
  invoiceNumberingMode: InvoiceNumberingMode;
  invoiceNumberPrefix: string;
  nextInvoiceNumber: number;
  /** Zero-padding width for the numeric portion. Absent on older stored settings. */
  invoiceNumberPadding?: number;
  defaultPaymentTermsDays: number;
  defaultTaxRateBasisPoints: number;
  /** Invoice-level tax catalog. Absent on older stored settings. */
  taxCatalog?: TaxCatalogSettings;
  defaultProductUnit: ProductUnit;
  /** Selected invoice PDF template id from the PDF feature registry. */
  selectedPdfTemplateId?: string;
}

export interface AppSettings extends OfflineEntity {
  businessId: string;
  themePreference: ThemePreference;
  locale: string;
  invoice: InvoiceSettings;
}

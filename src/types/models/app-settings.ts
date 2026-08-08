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

export interface InvoiceSettings {
  invoiceNumberingMode: InvoiceNumberingMode;
  invoiceNumberPrefix: string;
  nextInvoiceNumber: number;
  defaultPaymentTermsDays: number;
  defaultTaxRateBasisPoints: number;
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

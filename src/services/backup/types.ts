import type {
  Business,
  Customer,
  Invoice,
  InvoiceNumberingMode,
  Product,
  TaxCatalogSettings,
} from '@/types/models';

export const EASY_INVOICE_BACKUP_TYPE = 'easy-invoice-maker' as const;
export const EASY_INVOICE_BACKUP_VERSION = 1 as const;

export type InvoiceNumberFormatBackup = {
  invoiceNumberingMode: InvoiceNumberingMode;
  invoiceNumberPrefix: string;
  nextInvoiceNumber: number;
  invoiceNumberPadding?: number;
};

export type CurrencySettingsBackup = {
  currencyCode: string | null;
};

export type CountrySettingsBackup = {
  countryCode: string | null;
};

/** Full invoice record without generated PDF cache metadata. */
export type InvoiceBackupRecord = Omit<Invoice, 'document'>;

export type EasyInvoiceBackupData = {
  businessProfile: Business | null;
  customers: Customer[];
  products: Product[];
  invoices: InvoiceBackupRecord[];
  invoiceNumberFormat: InvoiceNumberFormatBackup | null;
  currencySettings: CurrencySettingsBackup;
  countrySettings: CountrySettingsBackup;
  taxSettings: TaxCatalogSettings | null;
};

export type EasyInvoiceBackup = {
  backupType: typeof EASY_INVOICE_BACKUP_TYPE;
  backupVersion: typeof EASY_INVOICE_BACKUP_VERSION;
  createdAt: string;
  appVersion: string;
  data: EasyInvoiceBackupData;
};

export type CreatedBackupFile = {
  uri: string;
  fileName: string;
};

export class BackupExportError extends Error {
  public constructor(message = 'Unable to export backup. Please try again.') {
    super(message);
    this.name = 'BackupExportError';
  }
}

export class BackupSaveError extends Error {
  public constructor(message = 'Unable to save backup. Please try again.') {
    super(message);
    this.name = 'BackupSaveError';
  }
}

export class BackupShareError extends Error {
  public constructor(message = 'Unable to share backup. Please try again.') {
    super(message);
    this.name = 'BackupShareError';
  }
}

export class BackupShareUnavailableError extends BackupShareError {
  public constructor() {
    super('Unable to share backup. Please try again.');
    this.name = 'BackupShareUnavailableError';
  }
}

export class BackupUserCancelledError extends Error {
  public constructor() {
    super('Backup action was cancelled.');
    this.name = 'BackupUserCancelledError';
  }
}

export class BackupInvalidError extends Error {
  public constructor(message = 'Selected file is not a valid Easy Invoice Maker backup.') {
    super(message);
    this.name = 'BackupInvalidError';
  }
}

export class BackupUnsupportedVersionError extends Error {
  public constructor() {
    super("This backup version isn't supported by this version of Easy Invoice Maker.");
    this.name = 'BackupUnsupportedVersionError';
  }
}

export class BackupReadError extends Error {
  public constructor(message = 'Unable to read backup. Please try again.') {
    super(message);
    this.name = 'BackupReadError';
  }
}

export class BackupRestoreError extends Error {
  public constructor(message = 'Unable to restore backup. Your data was not changed.') {
    super(message);
    this.name = 'BackupRestoreError';
  }
}

export type BackupImportStage = 'selecting' | 'reading' | 'validating' | 'restoring';

export type BackupImportPreview = {
  backup: EasyInvoiceBackup;
  createdAtLabel: string;
  appVersion: string;
  customerCount: number;
  productCount: number;
  invoiceCount: number;
  hasBusinessProfile: boolean;
  hasInvoiceNumberFormat: boolean;
  currencyCode: string | null;
  countryCode: string | null;
  hasCountrySettings: boolean;
  hasTaxSettings: boolean;
  skippedBusinessAssets: boolean;
};

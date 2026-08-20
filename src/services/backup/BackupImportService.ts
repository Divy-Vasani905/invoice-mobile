import { format, parseISO } from 'date-fns';
import { File } from 'expo-file-system';
import { getInfoAsync } from 'expo-file-system/legacy';

import { isValidCountryCode, isValidCurrencyCode } from '@/features/preferences/catalog';
import { CrashlyticsService } from '@/services/crashlytics';
import { StorageKeys, settingsRepository, storage, userPreferencesRepository } from '@/storage';
import { useUserPreferencesStore } from '@/stores/user-preferences';
import {
  InvoiceNumberingMode,
  ProductUnit,
  SyncStatus,
  ThemePreference,
  DEFAULT_INVOICE_NUMBER_PADDING,
  DEFAULT_INVOICE_PREFIX,
  DEFAULT_NEXT_INVOICE_NUMBER,
  DEFAULT_TAX_CATALOG,
  DEFAULT_USER_PREFERENCES,
  type AppSettings,
  type Business,
  type Invoice,
} from '@/types/models';

import {
  BackupInvalidError,
  BackupReadError,
  BackupRestoreError,
  BackupUnsupportedVersionError,
  BackupUserCancelledError,
  type BackupImportPreview,
  type BackupImportStage,
  type EasyInvoiceBackup,
  type InvoiceBackupRecord,
} from './types';
import { parseAndValidateBackupJson } from './validation';

let restoreInProgress = false;

function isPickerCancellation(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('cancel') || message.includes('dismiss');
}

function formatBackupCreatedAt(createdAt: string): string {
  try {
    return format(parseISO(createdAt), 'd MMM yyyy');
  } catch {
    return createdAt;
  }
}

async function assetUriExists(uri: string | undefined): Promise<boolean> {
  if (uri == null || uri.trim().length === 0) return false;
  try {
    const info = await getInfoAsync(uri);
    return info.exists === true;
  } catch {
    return false;
  }
}

async function sanitizeBusinessProfile(
  business: Business | null,
): Promise<{ business: Business | null; skippedBusinessAssets: boolean }> {
  if (business == null) {
    return { business: null, skippedBusinessAssets: false };
  }

  let skippedBusinessAssets = false;
  const next: Business = { ...business };

  if (business.logoUri != null && business.logoUri.length > 0) {
    if (await assetUriExists(business.logoUri)) {
      next.logoUri = business.logoUri;
    } else {
      delete next.logoUri;
      skippedBusinessAssets = true;
    }
  }

  if (business.authorizedSignatureUri != null && business.authorizedSignatureUri.length > 0) {
    if (await assetUriExists(business.authorizedSignatureUri)) {
      next.authorizedSignatureUri = business.authorizedSignatureUri;
    } else {
      delete next.authorizedSignatureUri;
      skippedBusinessAssets = true;
    }
  }

  return { business: next, skippedBusinessAssets };
}

function toInvoiceRecords(invoices: InvoiceBackupRecord[]): Invoice[] {
  return invoices.map((invoice) => {
    const { document: _document, ...record } = invoice as InvoiceBackupRecord & {
      document?: unknown;
    };
    return record;
  });
}

function recordsToMap<T extends { id: string }>(records: T[]): Record<string, T> {
  return Object.fromEntries(records.map((record) => [record.id, record]));
}

function snapshotManagedKeys(): Record<string, string | undefined> {
  return {
    [StorageKeys.business]: storage.getString(StorageKeys.business),
    [StorageKeys.customers]: storage.getString(StorageKeys.customers),
    [StorageKeys.products]: storage.getString(StorageKeys.products),
    [StorageKeys.invoices]: storage.getString(StorageKeys.invoices),
    [StorageKeys.settings]: storage.getString(StorageKeys.settings),
    [StorageKeys.userPreferences]: storage.getString(StorageKeys.userPreferences),
  };
}

function writeManagedKey(key: string, value: string | null): void {
  if (value == null) {
    storage.remove(key);
    return;
  }
  storage.set(key, value);
}

function restoreManagedKeys(snapshot: Record<string, string | undefined>): void {
  for (const [key, value] of Object.entries(snapshot)) {
    writeManagedKey(key, value ?? null);
  }
}

function defaultSettings(businessId: string): AppSettings {
  const timestamp = new Date().toISOString();
  return {
    id: `settings-${Date.now().toString(36)}`,
    businessId,
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
}

function prepareSettings(backup: EasyInvoiceBackup): AppSettings {
  const current = settingsRepository.get();
  const businessId = backup.data.businessProfile?.id ?? current?.businessId ?? 'local-business';
  const base = current ?? defaultSettings(businessId);
  const numbering = backup.data.invoiceNumberFormat;
  const timestamp = new Date().toISOString();

  return {
    ...base,
    businessId,
    invoice: {
      ...base.invoice,
      invoiceNumberingMode: numbering?.invoiceNumberingMode ?? InvoiceNumberingMode.Automatic,
      invoiceNumberPrefix: numbering?.invoiceNumberPrefix ?? DEFAULT_INVOICE_PREFIX,
      nextInvoiceNumber: numbering?.nextInvoiceNumber ?? DEFAULT_NEXT_INVOICE_NUMBER,
      invoiceNumberPadding: numbering?.invoiceNumberPadding ?? DEFAULT_INVOICE_NUMBER_PADDING,
      taxCatalog: backup.data.taxSettings ?? DEFAULT_TAX_CATALOG,
    },
    updatedAt: timestamp,
    localRevision: base.localRevision + 1,
    syncStatus: SyncStatus.Pending,
  };
}

function normalizeCountryCode(countryCode: string | null | undefined): string | null {
  if (countryCode == null || countryCode.length === 0) return null;
  const normalized = countryCode.toUpperCase();
  return isValidCountryCode(normalized) ? normalized : countryCode;
}

function prepareUserPreferences(input: {
  currencyCode: string | null;
  countryCode?: string | null;
  restoreCountry: boolean;
}) {
  const current = userPreferencesRepository.get();
  const normalizedCurrency =
    input.currencyCode == null || input.currencyCode.length === 0
      ? null
      : isValidCurrencyCode(input.currencyCode.toUpperCase())
        ? input.currencyCode.toUpperCase()
        : input.currencyCode;
  const normalizedCountry = input.restoreCountry
    ? normalizeCountryCode(input.countryCode)
    : (current?.countryCode ?? null);

  if (current == null) {
    return {
      ...DEFAULT_USER_PREFERENCES,
      onboardingCompleted: true,
      currencyCode: normalizedCurrency,
      countryCode: normalizedCountry,
    };
  }

  return {
    ...current,
    currencyCode: normalizedCurrency,
    countryCode: normalizedCountry,
  };
}

function hydrateRestoredPreferences(input: {
  currencyCode: string | null;
  countryCode: string | null;
}): void {
  useUserPreferencesStore.setState({
    currencyCode: input.currencyCode,
    countryCode: input.countryCode,
  });
}

async function readPickedBackupText(onStage?: (stage: BackupImportStage) => void): Promise<string> {
  onStage?.('selecting');
  const picked = await File.pickFileAsync({
    mimeTypes: ['application/json', 'text/plain', 'application/octet-stream'],
  });
  if (picked.canceled || picked.result == null) {
    throw new BackupUserCancelledError();
  }

  onStage?.('reading');
  try {
    const contents = await picked.result.text();
    if (contents.trim().length === 0) {
      throw new BackupInvalidError();
    }
    return contents;
  } catch (error) {
    if (
      error instanceof BackupInvalidError ||
      error instanceof BackupUserCancelledError ||
      error instanceof BackupUnsupportedVersionError
    ) {
      throw error;
    }
    CrashlyticsService.log('[backup] failed reading selected backup file');
    CrashlyticsService.recordError(error, 'BackupImportReadFailed');
    throw new BackupReadError();
  }
}

export async function selectAndInspectBackup(
  onStage?: (stage: BackupImportStage) => void,
): Promise<BackupImportPreview> {
  try {
    const contents = await readPickedBackupText(onStage);
    onStage?.('validating');
    const backup = parseAndValidateBackupJson(contents);
    const { skippedBusinessAssets } = await sanitizeBusinessProfile(backup.data.businessProfile);

    return {
      backup,
      createdAtLabel: formatBackupCreatedAt(backup.createdAt),
      appVersion: backup.appVersion,
      customerCount: backup.data.customers.length,
      productCount: backup.data.products.length,
      invoiceCount: backup.data.invoices.length,
      hasBusinessProfile: backup.data.businessProfile != null,
      hasInvoiceNumberFormat: backup.data.invoiceNumberFormat != null,
      currencyCode: backup.data.currencySettings.currencyCode,
      countryCode: backup.data.countrySettings?.countryCode ?? null,
      hasCountrySettings: backup.data.countrySettings != null,
      hasTaxSettings: backup.data.taxSettings != null,
      skippedBusinessAssets,
    };
  } catch (error) {
    if (
      error instanceof BackupUserCancelledError ||
      error instanceof BackupInvalidError ||
      error instanceof BackupUnsupportedVersionError ||
      error instanceof BackupReadError
    ) {
      throw error;
    }
    if (isPickerCancellation(error)) {
      throw new BackupUserCancelledError();
    }
    CrashlyticsService.log('[backup] failed inspecting backup file');
    CrashlyticsService.recordError(error, 'BackupImportInspectFailed');
    throw new BackupInvalidError();
  }
}

export async function restoreValidatedBackup(backup: EasyInvoiceBackup): Promise<void> {
  if (restoreInProgress) {
    throw new BackupRestoreError();
  }
  restoreInProgress = true;

  const snapshot = snapshotManagedKeys();
  let wroteManagedKeys = false;

  try {
    parseAndValidateBackupJson(JSON.stringify(backup));
    const { business } = await sanitizeBusinessProfile(backup.data.businessProfile);
    const customers = backup.data.customers;
    const products = backup.data.products;
    const invoices = toInvoiceRecords(backup.data.invoices);
    const settings = prepareSettings(backup);
    const preferences = prepareUserPreferences({
      currencyCode: backup.data.currencySettings.currencyCode,
      countryCode: backup.data.countrySettings?.countryCode ?? null,
      restoreCountry: backup.data.countrySettings != null,
    });

    const payloads = {
      [StorageKeys.business]: business == null ? null : JSON.stringify(business),
      [StorageKeys.customers]: JSON.stringify(recordsToMap(customers)),
      [StorageKeys.products]: JSON.stringify(recordsToMap(products)),
      [StorageKeys.invoices]: JSON.stringify(recordsToMap(invoices)),
      [StorageKeys.settings]: JSON.stringify(settings),
      [StorageKeys.userPreferences]: JSON.stringify(preferences),
    };

    wroteManagedKeys = true;
    writeManagedKey(StorageKeys.business, payloads[StorageKeys.business]);
    writeManagedKey(StorageKeys.customers, payloads[StorageKeys.customers]);
    writeManagedKey(StorageKeys.products, payloads[StorageKeys.products]);
    writeManagedKey(StorageKeys.invoices, payloads[StorageKeys.invoices]);
    writeManagedKey(StorageKeys.settings, payloads[StorageKeys.settings]);
    writeManagedKey(StorageKeys.userPreferences, payloads[StorageKeys.userPreferences]);

    hydrateRestoredPreferences({
      currencyCode: preferences.currencyCode,
      countryCode: preferences.countryCode,
    });
  } catch (error) {
    if (wroteManagedKeys) {
      try {
        restoreManagedKeys(snapshot);
      } catch (rollbackError) {
        CrashlyticsService.log('[backup] failed rolling back backup restore');
        CrashlyticsService.recordError(rollbackError, 'BackupRestoreRollbackFailed');
      }
    }
    if (
      error instanceof BackupInvalidError ||
      error instanceof BackupUnsupportedVersionError ||
      error instanceof BackupRestoreError
    ) {
      throw error;
    }
    CrashlyticsService.log('[backup] failed restoring backup');
    CrashlyticsService.recordError(error, 'BackupRestoreFailed');
    throw new BackupRestoreError();
  } finally {
    restoreInProgress = false;
  }
}

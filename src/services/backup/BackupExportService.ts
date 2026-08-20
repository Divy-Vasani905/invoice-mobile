import { format } from 'date-fns';
import {
  cacheDirectory,
  deleteAsync,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  StorageAccessFramework,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { businessFeatureRepository } from '@/features/business/repositories/BusinessRepository';
import { getAppVersion } from '@/features/settings/utils/app-version';
import { CrashlyticsService } from '@/services/crashlytics';
import {
  customerRepository,
  invoiceRepository,
  productRepository,
  settingsRepository,
  userPreferencesRepository,
} from '@/storage';
import type { Invoice } from '@/types/models';

import {
  BackupExportError,
  BackupSaveError,
  BackupShareError,
  BackupShareUnavailableError,
  BackupUserCancelledError,
  EASY_INVOICE_BACKUP_TYPE,
  EASY_INVOICE_BACKUP_VERSION,
  type CreatedBackupFile,
  type EasyInvoiceBackup,
  type EasyInvoiceBackupData,
  type InvoiceBackupRecord,
} from './types';

function readStage<T>(stage: string, read: () => T): T {
  try {
    return read();
  } catch (error) {
    CrashlyticsService.log(`[backup] failed reading ${stage}`);
    CrashlyticsService.recordError(error, 'BackupExportReadFailed');
    throw new BackupExportError();
  }
}

function toInvoiceBackupRecord(invoice: Invoice): InvoiceBackupRecord {
  const record = { ...invoice };
  delete record.document;
  return record;
}

/**
 * Builds a read-only snapshot of backup-managed user data.
 * Logo/signature URIs on the business profile are device-local file paths and
 * are not portable across devices; they are included as stored without embedding
 * binary assets (that would need a separate architecture).
 */
function collectBackupData(): EasyInvoiceBackupData {
  const businessProfile = readStage('businessProfile', () =>
    businessFeatureRepository.getActiveBusiness(),
  );
  const customers = readStage('customers', () => customerRepository.getAll());
  const products = readStage('products', () => productRepository.getAll());
  const invoices = readStage('invoices', () =>
    invoiceRepository.getAll().map(toInvoiceBackupRecord),
  );
  const settings = readStage('settings', () => settingsRepository.get());
  const preferences = readStage('currencySettings', () => userPreferencesRepository.get());

  const invoiceNumberFormat =
    settings == null
      ? null
      : {
          invoiceNumberingMode: settings.invoice.invoiceNumberingMode,
          invoiceNumberPrefix: settings.invoice.invoiceNumberPrefix,
          nextInvoiceNumber: settings.invoice.nextInvoiceNumber,
          invoiceNumberPadding: settings.invoice.invoiceNumberPadding,
        };

  return {
    businessProfile,
    customers,
    products,
    invoices,
    invoiceNumberFormat,
    currencySettings: {
      currencyCode: preferences?.currencyCode ?? null,
    },
    countrySettings: {
      countryCode: preferences?.countryCode ?? null,
    },
    taxSettings: settings?.invoice.taxCatalog ?? null,
  };
}

function assertBackupComplete(backup: EasyInvoiceBackup): void {
  const { data } = backup;
  const missing =
    backup.backupType !== EASY_INVOICE_BACKUP_TYPE ||
    backup.backupVersion !== EASY_INVOICE_BACKUP_VERSION ||
    backup.createdAt.length === 0 ||
    !Array.isArray(data.customers) ||
    !Array.isArray(data.products) ||
    !Array.isArray(data.invoices) ||
    !('businessProfile' in data) ||
    !('invoiceNumberFormat' in data) ||
    data.currencySettings == null ||
    data.countrySettings == null ||
    !('taxSettings' in data);

  if (missing) {
    throw new BackupExportError();
  }
}

function buildBackupFileName(createdAt: Date): string {
  return `EasyInvoiceMaker_Backup_${format(createdAt, 'yyyy-MM-dd')}.json`;
}

async function getBackupDirectory(): Promise<string> {
  if (cacheDirectory == null) {
    throw new BackupExportError();
  }
  const directory = `${cacheDirectory}backups/`;
  const info = await getInfoAsync(directory);
  if (!info.exists) {
    await makeDirectoryAsync(directory, { intermediates: true });
  }
  return directory;
}

async function writeBackupFile(backup: EasyInvoiceBackup, fileName: string): Promise<string> {
  try {
    const directory = await getBackupDirectory();
    const uri = `${directory}${fileName}`;
    const existing = await getInfoAsync(uri);
    if (existing.exists) {
      await deleteAsync(uri, { idempotent: true });
    }

    const json = JSON.stringify(backup, null, 2);
    await writeAsStringAsync(uri, json);

    const written = await getInfoAsync(uri);
    if (!written.exists || (written.size != null && written.size === 0)) {
      throw new BackupExportError();
    }
    return uri;
  } catch (error) {
    if (error instanceof BackupExportError) throw error;
    CrashlyticsService.log('[backup] failed writing backup file');
    CrashlyticsService.recordError(error, 'BackupExportWriteFailed');
    throw new BackupExportError();
  }
}

function backupFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.json$/i, '');
}

function isUserCancelledError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('cancel') || message.includes('dismiss');
}

async function saveBackupWithStorageAccessFramework(uri: string, fileName: string): Promise<void> {
  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted) {
    throw new BackupUserCancelledError();
  }

  const destinationUri = await StorageAccessFramework.createFileAsync(
    permissions.directoryUri,
    backupFileNameWithoutExtension(fileName),
    'application/json',
  );
  const contents = await readAsStringAsync(uri);
  await StorageAccessFramework.writeAsStringAsync(destinationUri, contents);
}

/**
 * Reads current user data and writes a versioned JSON backup once.
 * Does not mutate stored records or invoice numbering, and does not share.
 */
export async function exportBackup(): Promise<CreatedBackupFile> {
  const createdAt = new Date();
  const backup: EasyInvoiceBackup = {
    backupType: EASY_INVOICE_BACKUP_TYPE,
    backupVersion: EASY_INVOICE_BACKUP_VERSION,
    createdAt: createdAt.toISOString(),
    appVersion: getAppVersion(),
    data: collectBackupData(),
  };

  assertBackupComplete(backup);

  const fileName = buildBackupFileName(createdAt);
  const uri = await writeBackupFile(backup, fileName);
  return { uri, fileName };
}

/**
 * Opens the existing native share sheet for an already-generated backup file.
 */
export async function shareBackup(uri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new BackupShareUnavailableError();
  }

  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Backup',
      UTI: 'public.json',
    });
  } catch (error) {
    if (isUserCancelledError(error)) {
      throw new BackupUserCancelledError();
    }
    CrashlyticsService.log('[backup] failed sharing backup file');
    CrashlyticsService.recordError(error, 'BackupExportShareFailed');
    throw new BackupShareError();
  }
}

/**
 * Copies the already-generated backup JSON to a user-chosen location.
 * Android uses Storage Access Framework (Downloads, Documents, Drive, etc.).
 * iOS uses the system share sheet so the user can save to Files.
 */
export async function saveBackupToDevice(uri: string, fileName: string): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await saveBackupWithStorageAccessFramework(uri, fileName);
      return;
    }

    await shareBackup(uri);
  } catch (error) {
    if (error instanceof BackupUserCancelledError) {
      throw error;
    }
    if (isUserCancelledError(error)) {
      throw new BackupUserCancelledError();
    }
    CrashlyticsService.log('[backup] failed saving backup file');
    CrashlyticsService.recordError(error, 'BackupExportSaveFailed');
    throw new BackupSaveError();
  }
}

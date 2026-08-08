import { settingsRepository } from '@/storage';
import {
  InvoiceNumberingMode,
  ProductUnit,
  SyncStatus,
  ThemePreference,
  type AppSettings,
} from '@/types/models';

import {
  DEFAULT_PDF_TEMPLATE_ID,
  getInvoicePdfTemplate,
  isInvoicePdfTemplateId,
} from '../utils/pdfTemplateRegistry';

import type { InvoicePdfTemplateId } from '../types/pdf.types';

function createDefaultSettings(): AppSettings {
  const timestamp = new Date().toISOString();
  return {
    id: `settings-${Date.now().toString(36)}`,
    businessId: 'local-business',
    themePreference: ThemePreference.System,
    locale: 'en',
    invoice: {
      invoiceNumberingMode: InvoiceNumberingMode.Automatic,
      invoiceNumberPrefix: 'INV-',
      nextInvoiceNumber: 1,
      defaultPaymentTermsDays: 30,
      defaultTaxRateBasisPoints: 0,
      defaultProductUnit: ProductUnit.Each,
      selectedPdfTemplateId: DEFAULT_PDF_TEMPLATE_ID,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    localRevision: 1,
    syncStatus: SyncStatus.Pending,
  };
}

function ensureSettings(): AppSettings {
  const existing = settingsRepository.get();
  if (existing != null) return existing;
  const created = createDefaultSettings();
  settingsRepository.update(created);
  return created;
}

export function getSelectedPdfTemplateId(): InvoicePdfTemplateId {
  const settings = ensureSettings();
  const selected = settings.invoice.selectedPdfTemplateId;
  if (selected != null && isInvoicePdfTemplateId(selected)) return selected;
  return DEFAULT_PDF_TEMPLATE_ID;
}

export function setSelectedPdfTemplateId(templateId: InvoicePdfTemplateId): InvoicePdfTemplateId {
  const settings = ensureSettings();
  const resolved = getInvoicePdfTemplate(templateId).id;
  settingsRepository.update({
    ...settings,
    invoice: {
      ...settings.invoice,
      selectedPdfTemplateId: resolved,
    },
    updatedAt: new Date().toISOString(),
    localRevision: settings.localRevision + 1,
    syncStatus: SyncStatus.Pending,
  });
  return resolved;
}

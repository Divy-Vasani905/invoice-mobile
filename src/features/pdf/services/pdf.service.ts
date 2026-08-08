import * as Print from 'expo-print';

import { businessFeatureRepository } from '@/features/business/repositories/BusinessRepository';
import { invoiceFeatureRepository } from '@/features/invoice/repositories/InvoiceRepository';
import { invoiceRepository } from '@/storage';
import { SyncStatus } from '@/types/models';

import {
  buildInvoicePdfFileName,
  getInvoicePdfPath,
  pdfFileExists,
  persistGeneratedPdf,
} from './pdfFile.service';
import { getSelectedPdfTemplateId } from './pdfTemplateSettings.service';
import { PdfGenerationError } from '../types/pdf.types';
import { buildContentFingerprint, buildInvoicePdfDocumentModel } from '../utils/pdfFormatting';
import { toImageDataUri } from '../utils/pdfImages';
import { getInvoicePdfTemplate } from '../utils/pdfTemplateRegistry';

import type {
  GenerateInvoicePdfOptions,
  GeneratedInvoicePdf,
  InvoicePdfTemplateId,
} from '../types/pdf.types';

const generationLocks = new Map<string, Promise<GeneratedInvoicePdf>>();

export async function generateInvoicePdf(
  options: GenerateInvoicePdfOptions,
): Promise<GeneratedInvoicePdf> {
  const lockKey = `${options.invoiceId}:${options.templateId ?? 'selected'}:${options.force === true}`;
  const existingLock = generationLocks.get(lockKey);
  if (existingLock != null) return existingLock;

  const task = generateInvoicePdfInternal(options).finally(() => {
    generationLocks.delete(lockKey);
  });
  generationLocks.set(lockKey, task);
  return task;
}

async function generateInvoicePdfInternal(
  options: GenerateInvoicePdfOptions,
): Promise<GeneratedInvoicePdf> {
  const invoice = invoiceFeatureRepository.getInvoiceById(options.invoiceId);
  if (invoice == null) {
    throw new PdfGenerationError('Invoice not found.');
  }

  const business = businessFeatureRepository.getActiveBusiness();
  if (business == null && (invoice.business.name == null || invoice.business.name.length === 0)) {
    throw new PdfGenerationError('Add a business profile before generating a PDF.');
  }

  const templateId = (options.templateId ?? getSelectedPdfTemplateId()) as InvoicePdfTemplateId;
  const template = getInvoicePdfTemplate(templateId);
  const fingerprint = buildContentFingerprint(invoice, template.id);
  const destinationUri = await getInvoicePdfPath(invoice.invoiceNumber, template.id);

  if (options.force !== true) {
    const cached = invoice.document;
    if (
      cached?.uri != null &&
      cached.checksum === fingerprint &&
      (await pdfFileExists(cached.uri))
    ) {
      return {
        uri: cached.uri,
        fileName: buildInvoicePdfFileName(invoice.invoiceNumber, template.id),
        templateId: template.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        contentFingerprint: fingerprint,
        generatedAt: cached.generatedAt,
      };
    }

    if (await pdfFileExists(destinationUri)) {
      // File exists but invoice document metadata may be stale after edits.
      if (cached?.checksum === fingerprint) {
        return {
          uri: destinationUri,
          fileName: buildInvoicePdfFileName(invoice.invoiceNumber, template.id),
          templateId: template.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          contentFingerprint: fingerprint,
          generatedAt: cached?.generatedAt ?? new Date().toISOString(),
        };
      }
    }
  }

  try {
    const [logoDataUri, signatureDataUri] = await Promise.all([
      toImageDataUri(invoice.business.logoUri ?? business?.logoUri),
      toImageDataUri(business?.authorizedSignatureUri),
    ]);

    const model = buildInvoicePdfDocumentModel({
      invoice,
      business,
      logoDataUri,
      signatureDataUri,
    });
    model.contentFingerprint = fingerprint;

    const html = template.renderHtml(model);
    const printed = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const uri = await persistGeneratedPdf(printed.uri, destinationUri);
    const generatedAt = new Date().toISOString();

    invoiceRepository.update({
      ...invoice,
      document: {
        uri,
        generatedAt,
        checksum: fingerprint,
      },
      updatedAt: generatedAt,
      localRevision: invoice.localRevision + 1,
      syncStatus: SyncStatus.Pending,
    });

    return {
      uri,
      fileName: buildInvoicePdfFileName(invoice.invoiceNumber, template.id),
      templateId: template.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      contentFingerprint: fingerprint,
      generatedAt,
      numberOfPages: printed.numberOfPages,
    };
  } catch (error) {
    if (error instanceof PdfGenerationError) throw error;
    throw new PdfGenerationError(
      error instanceof Error ? error.message : 'Unable to create invoice PDF. Please try again.',
    );
  }
}

export async function generateSampleTemplatePdf(
  templateId: InvoicePdfTemplateId,
  html: string,
): Promise<string> {
  const printed = await Print.printToFileAsync({ html, base64: false });
  return printed.uri;
}

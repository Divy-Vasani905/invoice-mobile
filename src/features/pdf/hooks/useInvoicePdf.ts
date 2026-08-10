import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import { INVOICES_QUERY_KEY } from '@/features/invoice/hooks/useInvoices';
import { AnalyticsEvents, AnalyticsService } from '@/services/analytics';
import { CrashlyticsService } from '@/services/crashlytics';

import { generateInvoicePdf } from '../services/pdf.service';
import { printPdfFile } from '../services/pdfPrint.service';
import { sharePdfFile } from '../services/pdfShare.service';
import { getSelectedPdfTemplateId } from '../services/pdfTemplateSettings.service';
import {
  PdfGenerationError,
  PdfPrintUnavailableError,
  PdfShareUnavailableError,
  PdfUserCancelledError,
  type GeneratedInvoicePdf,
  type InvoicePdfTemplateId,
} from '../types/pdf.types';

export function useInvoicePdf(invoiceId?: string) {
  const queryClient = useQueryClient();
  const [pdf, setPdf] = useState<GeneratedInvoicePdf | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const reset = useCallback(() => {
    setPdf(null);
    setError(null);
    setIsGenerating(false);
    setIsSharing(false);
    setIsPrinting(false);
    inFlightRef.current = false;
  }, []);

  const generate = useCallback(
    async (options?: { templateId?: InvoicePdfTemplateId; force?: boolean }) => {
      if (invoiceId == null) {
        const message = 'Invoice not found.';
        setError(message);
        throw new PdfGenerationError(message);
      }
      if (inFlightRef.current) {
        throw new PdfGenerationError('PDF generation is already in progress.');
      }

      inFlightRef.current = true;
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generateInvoicePdf({
          invoiceId,
          templateId: options?.templateId ?? getSelectedPdfTemplateId(),
          force: options?.force,
        });
        setPdf(result);
        void queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
        return result;
      } catch (err) {
        const message =
          err instanceof PdfGenerationError
            ? err.message
            : 'Unable to create invoice PDF. Please try again.';
        if (!(err instanceof PdfGenerationError)) {
          CrashlyticsService.recordError(err, 'PdfGenerationUnexpected');
        } else {
          CrashlyticsService.log(`PDF generation failed: ${message}`);
        }
        setError(message);
        throw err instanceof Error ? err : new PdfGenerationError(message);
      } finally {
        inFlightRef.current = false;
        setIsGenerating(false);
      }
    },
    [invoiceId, queryClient],
  );

  const ensurePdf = useCallback(
    async (options?: { templateId?: InvoicePdfTemplateId; force?: boolean }) => {
      // Always go through the service so invoice edits invalidate stale PDFs.
      return generate(options);
    },
    [generate],
  );

  const share = useCallback(
    async (options?: { templateId?: InvoicePdfTemplateId; force?: boolean }) => {
      setIsSharing(true);
      setError(null);
      try {
        const file = await ensurePdf(options);
        await sharePdfFile(file.uri, `Share ${file.invoiceNumber}`);
        void AnalyticsService.logEvent(AnalyticsEvents.InvoiceShared, {
          template_id: file.templateId,
        });
        return file;
      } catch (err) {
        if (err instanceof PdfUserCancelledError) return null;
        const message =
          err instanceof PdfShareUnavailableError || err instanceof PdfGenerationError
            ? err.message
            : 'Unable to share invoice PDF. Please try again.';
        if (
          !(err instanceof PdfShareUnavailableError) &&
          !(err instanceof PdfGenerationError) &&
          !(err instanceof PdfUserCancelledError)
        ) {
          CrashlyticsService.recordError(err, 'PdfShareUnexpected');
        }
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setIsSharing(false);
      }
    },
    [ensurePdf],
  );

  const print = useCallback(
    async (options?: { templateId?: InvoicePdfTemplateId; force?: boolean }) => {
      setIsPrinting(true);
      setError(null);
      try {
        const file = await ensurePdf(options);
        await printPdfFile(file.uri);
        return file;
      } catch (err) {
        if (err instanceof PdfUserCancelledError) return null;
        const message =
          err instanceof PdfPrintUnavailableError || err instanceof PdfGenerationError
            ? err.message
            : 'Unable to print invoice PDF. Please try again.';
        if (
          !(err instanceof PdfPrintUnavailableError) &&
          !(err instanceof PdfGenerationError) &&
          !(err instanceof PdfUserCancelledError)
        ) {
          CrashlyticsService.recordError(err, 'PdfPrintUnexpected');
        }
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setIsPrinting(false);
      }
    },
    [ensurePdf],
  );

  return {
    pdf,
    error,
    isGenerating,
    isSharing,
    isPrinting,
    isBusy: isGenerating || isSharing || isPrinting,
    generate,
    ensurePdf,
    share,
    print,
    reset,
  };
}

import * as Print from 'expo-print';

import { PdfPrintUnavailableError, PdfUserCancelledError } from '../types/pdf.types';

export async function printPdfFile(uri: string): Promise<void> {
  try {
    await Print.printAsync({ uri });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (
      message.includes('cancel') ||
      message.includes('dismiss') ||
      message.includes('closed') ||
      message.includes('did not complete')
    ) {
      throw new PdfUserCancelledError();
    }
    if (message.includes('not available') || message.includes('unsupported')) {
      throw new PdfPrintUnavailableError();
    }
    throw error;
  }
}

export async function printHtml(html: string): Promise<void> {
  try {
    await Print.printAsync({ html });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (
      message.includes('cancel') ||
      message.includes('dismiss') ||
      message.includes('closed') ||
      message.includes('did not complete')
    ) {
      throw new PdfUserCancelledError();
    }
    throw error;
  }
}

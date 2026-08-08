import * as Sharing from 'expo-sharing';

import { PdfShareUnavailableError, PdfUserCancelledError } from '../types/pdf.types';

export async function sharePdfFile(uri: string, dialogTitle?: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new PdfShareUnavailableError();
  }

  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: dialogTitle ?? 'Share Invoice PDF',
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (message.includes('cancel') || message.includes('dismiss')) {
      throw new PdfUserCancelledError();
    }
    throw error;
  }
}

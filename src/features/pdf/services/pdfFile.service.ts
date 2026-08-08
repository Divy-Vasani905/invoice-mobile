import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

function getPdfDirectory(): string {
  if (documentDirectory == null) {
    throw new Error('Local document storage is unavailable on this platform.');
  }
  return `${documentDirectory}invoice-pdfs/`;
}

export async function ensurePdfDirectory(): Promise<string> {
  const directory = getPdfDirectory();
  const info = await getInfoAsync(directory);
  if (!info.exists) {
    await makeDirectoryAsync(directory, { intermediates: true });
  }
  return directory;
}

export function sanitizePdfFileNamePart(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : 'Invoice';
}

export function buildInvoicePdfFileName(invoiceNumber: string, templateId: string): string {
  return `Invoice_${sanitizePdfFileNamePart(invoiceNumber)}_${sanitizePdfFileNamePart(templateId)}.pdf`;
}

export async function getInvoicePdfPath(
  invoiceNumber: string,
  templateId: string,
): Promise<string> {
  const directory = await ensurePdfDirectory();
  return `${directory}${buildInvoicePdfFileName(invoiceNumber, templateId)}`;
}

export async function pdfFileExists(uri: string): Promise<boolean> {
  try {
    const info = await getInfoAsync(uri);
    return info.exists && (info.size == null || info.size > 0);
  } catch {
    return false;
  }
}

export async function persistGeneratedPdf(
  sourceUri: string,
  destinationUri: string,
): Promise<string> {
  await ensurePdfDirectory();
  const existing = await getInfoAsync(destinationUri);
  if (existing.exists) {
    await deleteAsync(destinationUri, { idempotent: true });
  }
  await copyAsync({ from: sourceUri, to: destinationUri });
  return destinationUri;
}

export async function removePdfFile(uri?: string | null): Promise<void> {
  if (uri == null || uri.length === 0) return;
  try {
    const directory = getPdfDirectory();
    if (!uri.startsWith(directory)) return;
    await deleteAsync(uri, { idempotent: true });
  } catch {
    // Best-effort cleanup.
  }
}

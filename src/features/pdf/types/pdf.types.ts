export type InvoicePdfTemplateId = 'classic' | 'modern' | 'minimal';

export interface InvoicePdfParty {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  addressLines: string[];
  logoDataUri?: string;
  signatureDataUri?: string;
}

export interface InvoicePdfLineItem {
  id: string;
  position: number;
  description: string;
  details?: string;
  quantityLabel: string;
  unitLabel: string;
  unitPriceLabel: string;
  discountLabel?: string;
  taxLabel?: string;
  lineTotalLabel: string;
}

export interface InvoicePdfTotals {
  subtotalLabel: string;
  discountLabel: string;
  taxLabel: string;
  roundOffLabel: string;
  grandTotalLabel: string;
  paidLabel?: string;
  balanceLabel?: string;
}

export interface InvoicePdfDocumentModel {
  invoiceId: string;
  invoiceNumber: string;
  statusLabel: string;
  issuedAtLabel: string;
  dueAtLabel?: string;
  currencyCode: string;
  business: InvoicePdfParty;
  customer: InvoicePdfParty;
  items: InvoicePdfLineItem[];
  totals: InvoicePdfTotals;
  notes?: string;
  terms?: string;
  taxSummaryLabel: string;
  footerText: string;
  contentFingerprint: string;
}

export interface InvoicePdfTemplateMeta {
  id: InvoicePdfTemplateId;
  name: string;
  description: string;
  accentColor: string;
}

export interface InvoicePdfTemplate extends InvoicePdfTemplateMeta {
  renderHtml: (model: InvoicePdfDocumentModel) => string;
}

export interface GenerateInvoicePdfOptions {
  invoiceId: string;
  templateId?: InvoicePdfTemplateId;
  /** Force regeneration even if a matching cached file exists. */
  force?: boolean;
}

export interface GeneratedInvoicePdf {
  uri: string;
  fileName: string;
  templateId: InvoicePdfTemplateId;
  invoiceId: string;
  invoiceNumber: string;
  contentFingerprint: string;
  generatedAt: string;
  numberOfPages?: number;
}

export class PdfGenerationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'PdfGenerationError';
  }
}

export class PdfShareUnavailableError extends Error {
  public constructor(message = 'Sharing is not available on this device.') {
    super(message);
    this.name = 'PdfShareUnavailableError';
  }
}

export class PdfPrintUnavailableError extends Error {
  public constructor(message = 'Printing is not available on this device.') {
    super(message);
    this.name = 'PdfPrintUnavailableError';
  }
}

export class PdfUserCancelledError extends Error {
  public constructor(message = 'Action cancelled.') {
    super(message);
    this.name = 'PdfUserCancelledError';
  }
}

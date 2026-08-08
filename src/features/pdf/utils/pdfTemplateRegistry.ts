import { classicInvoiceTemplate } from '../templates/classic/classic.template';
import { minimalInvoiceTemplate } from '../templates/minimal/minimal.template';
import { modernInvoiceTemplate } from '../templates/modern/modern.template';

import type {
  InvoicePdfTemplate,
  InvoicePdfTemplateId,
  InvoicePdfTemplateMeta,
} from '../types/pdf.types';

export const DEFAULT_PDF_TEMPLATE_ID: InvoicePdfTemplateId = 'classic';

const TEMPLATES: readonly InvoicePdfTemplate[] = [
  classicInvoiceTemplate,
  modernInvoiceTemplate,
  minimalInvoiceTemplate,
];

export function getInvoicePdfTemplates(): InvoicePdfTemplateMeta[] {
  return TEMPLATES.map(({ id, name, description, accentColor }) => ({
    id,
    name,
    description,
    accentColor,
  }));
}

export function getInvoicePdfTemplate(templateId?: string | null): InvoicePdfTemplate {
  const match = TEMPLATES.find((template) => template.id === templateId);
  return match ?? TEMPLATES.find((template) => template.id === DEFAULT_PDF_TEMPLATE_ID)!;
}

export function isInvoicePdfTemplateId(value: string): value is InvoicePdfTemplateId {
  return TEMPLATES.some((template) => template.id === value);
}

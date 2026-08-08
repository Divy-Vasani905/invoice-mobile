import { escapeHtml } from '../../utils/pdfFormatting';
import {
  renderFooter,
  renderHtmlDocument,
  renderItemsTable,
  renderNotes,
  renderPartyBlock,
  renderSignature,
  renderTotals,
} from '../shared/htmlDocument';

import type { InvoicePdfDocumentModel, InvoicePdfTemplate } from '../../types/pdf.types';

const ACCENT = '#1f2937';

function renderClassicHtml(model: InvoicePdfDocumentModel): string {
  const logo =
    model.business.logoDataUri != null
      ? `<img src="${model.business.logoDataUri}" alt="Logo" style="max-height:56px;max-width:160px;margin-bottom:8px;" />`
      : '';

  const body = `
    <div class="header avoid-break" style="display:flex;justify-content:space-between;gap:16px;border-bottom:2px solid ${ACCENT};padding-bottom:12px;">
      <div style="flex:1;">
        ${logo}
        <div class="strong wrap" style="font-size:18px;">${escapeHtml(model.business.name)}</div>
        ${model.business.addressLines.map((line) => `<div class="muted wrap">${escapeHtml(line)}</div>`).join('')}
        ${
          model.business.email != null
            ? `<div class="muted wrap">${escapeHtml(model.business.email)}</div>`
            : ''
        }
        ${
          model.business.phone != null
            ? `<div class="muted wrap">${escapeHtml(model.business.phone)}</div>`
            : ''
        }
        ${
          model.business.taxId != null
            ? `<div class="muted wrap">Tax ID: ${escapeHtml(model.business.taxId)}</div>`
            : ''
        }
      </div>
      <div style="text-align:right;min-width:180px;">
        <div class="strong" style="font-size:22px;letter-spacing:1px;">INVOICE</div>
        <div class="strong mt-8">${escapeHtml(model.invoiceNumber)}</div>
        <div class="muted">Status: ${escapeHtml(model.statusLabel)}</div>
        <div class="muted">Issued: ${escapeHtml(model.issuedAtLabel)}</div>
        ${
          model.dueAtLabel != null
            ? `<div class="muted">Due: ${escapeHtml(model.dueAtLabel)}</div>`
            : ''
        }
        <div class="muted">Currency: ${escapeHtml(model.currencyCode)}</div>
      </div>
    </div>

    <div class="mt-16" style="display:flex;gap:24px;">
      <div style="flex:1;">${renderPartyBlock('Bill To', model.customer)}</div>
      <div style="flex:1;">
        <div class="party avoid-break">
          <div class="party-title">Invoice Summary</div>
          <div class="muted">${escapeHtml(model.taxSummaryLabel)}</div>
          <div class="strong mt-8" style="font-size:16px;">${escapeHtml(model.totals.grandTotalLabel)}</div>
        </div>
      </div>
    </div>

    <div class="mt-16">
      ${renderItemsTable(model, { headerBackground: ACCENT })}
    </div>

    <div class="mt-16" style="display:flex;justify-content:flex-end;">
      <div style="width:260px;">${renderTotals(model, ACCENT)}</div>
    </div>

    ${renderNotes(model)}
    ${renderSignature(model)}
    ${renderFooter(model)}
  `;

  const styles = `
    .party-title { font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#6b7280; margin-bottom:4px; }
    .party-name { font-size:13px; font-weight:700; margin-bottom:2px; }
    .items th, .items td { padding:8px 6px; border-bottom:1px solid #e5e7eb; vertical-align:top; }
    .items th { font-size:10px; text-transform:uppercase; letter-spacing:0.04em; }
    .totals td { padding:6px 0; }
    .totals .grand td { padding-top:10px; border-top:2px solid ${ACCENT}; font-size:13px; }
  `;

  return renderHtmlDocument({
    title: `Invoice ${model.invoiceNumber}`,
    styles,
    body,
  });
}

export const classicInvoiceTemplate: InvoicePdfTemplate = {
  id: 'classic',
  name: 'Classic',
  description: 'Clean business layout with a traditional invoice structure.',
  accentColor: ACCENT,
  renderHtml: renderClassicHtml,
};

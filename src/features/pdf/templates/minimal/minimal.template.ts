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

const ACCENT = '#334155';

function renderMinimalHtml(model: InvoicePdfDocumentModel): string {
  const logo =
    model.business.logoDataUri != null
      ? `<img src="${model.business.logoDataUri}" alt="Logo" style="max-height:40px;max-width:120px;margin-bottom:6px;" />`
      : '';

  const body = `
    <div class="avoid-break mb-16">
      ${logo}
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:baseline;">
        <div class="strong wrap" style="font-size:20px;">${escapeHtml(model.business.name)}</div>
        <div class="strong" style="font-size:18px;">${escapeHtml(model.invoiceNumber)}</div>
      </div>
      <div class="muted mt-8">
        Issued ${escapeHtml(model.issuedAtLabel)}
        ${model.dueAtLabel != null ? ` · Due ${escapeHtml(model.dueAtLabel)}` : ''}
        · ${escapeHtml(model.statusLabel)}
        · ${escapeHtml(model.currencyCode)}
      </div>
    </div>

    <div style="display:flex;gap:32px;" class="mb-16">
      <div style="flex:1;">${renderPartyBlock('From', model.business)}</div>
      <div style="flex:1;">${renderPartyBlock('Bill To', model.customer)}</div>
    </div>

    <div style="height:1px;background:#cbd5e1;margin:8px 0 16px;"></div>

    ${renderItemsTable(model, { headerBackground: ACCENT, showTaxColumn: true })}

    <div class="mt-16" style="display:flex;justify-content:flex-end;">
      <div style="width:240px;">${renderTotals(model, ACCENT)}</div>
    </div>

    ${renderNotes(model)}
    ${renderSignature(model)}
    ${renderFooter(model)}
  `;

  const styles = `
    .party-title { font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:#64748b; margin-bottom:4px; }
    .party-name { font-size:12px; font-weight:700; margin-bottom:2px; }
    .items th, .items td { padding:7px 4px; border-bottom:1px solid #e2e8f0; vertical-align:top; }
    .items th { font-weight:600; font-size:10px; }
    .totals td { padding:5px 0; }
    .totals .grand td { padding-top:8px; border-top:1px solid ${ACCENT}; font-size:13px; }
  `;

  return renderHtmlDocument({
    title: `Invoice ${model.invoiceNumber}`,
    styles,
    body,
  });
}

export const minimalInvoiceTemplate: InvoicePdfTemplate = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Simple professional design with quiet typography and clear structure.',
  accentColor: ACCENT,
  renderHtml: renderMinimalHtml,
};

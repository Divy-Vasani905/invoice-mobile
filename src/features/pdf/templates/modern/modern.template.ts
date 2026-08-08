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

const ACCENT = '#0f766e';

function renderModernHtml(model: InvoicePdfDocumentModel): string {
  const logo =
    model.business.logoDataUri != null
      ? `<img src="${model.business.logoDataUri}" alt="Logo" style="max-height:48px;max-width:140px;background:#fff;padding:6px;border-radius:8px;" />`
      : `<div style="font-size:20px;font-weight:700;color:#fff;">${escapeHtml(model.business.name)}</div>`;

  const body = `
    <div class="banner avoid-break" style="background:${ACCENT};color:#fff;border-radius:12px;padding:18px 16px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
        <div style="flex:1;">
          ${logo}
          ${
            model.business.logoDataUri != null
              ? `<div class="mt-8 strong wrap" style="font-size:16px;">${escapeHtml(model.business.name)}</div>`
              : ''
          }
          <div style="opacity:0.9;" class="wrap">
            ${[model.business.email, model.business.phone, model.business.website]
              .filter((value): value is string => value != null && value.length > 0)
              .map((value) => escapeHtml(value))
              .join(' · ')}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:24px;font-weight:700;">INVOICE</div>
          <div class="mt-8">${escapeHtml(model.invoiceNumber)}</div>
          <div style="opacity:0.9;">${escapeHtml(model.statusLabel)}</div>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:16px;" class="mb-16">
      <div style="flex:1;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:12px;">
        ${renderPartyBlock('Bill To', model.customer)}
      </div>
      <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
        <div class="party-title">Details</div>
        <div>Issued: ${escapeHtml(model.issuedAtLabel)}</div>
        ${model.dueAtLabel != null ? `<div>Due: ${escapeHtml(model.dueAtLabel)}</div>` : ''}
        <div>Currency: ${escapeHtml(model.currencyCode)}</div>
        ${
          model.business.taxId != null
            ? `<div>Tax ID: ${escapeHtml(model.business.taxId)}</div>`
            : ''
        }
        <div class="strong mt-8" style="font-size:18px;color:${ACCENT};">${escapeHtml(model.totals.grandTotalLabel)}</div>
      </div>
    </div>

    ${renderItemsTable(model, { headerBackground: ACCENT })}

    <div class="mt-16" style="display:flex;justify-content:flex-end;">
      <div style="width:280px;background:#f0fdfa;border-radius:10px;padding:12px;">
        ${renderTotals(model, ACCENT)}
      </div>
    </div>

    ${renderNotes(model)}
    ${renderSignature(model)}
    ${renderFooter(model)}
  `;

  const styles = `
    .party-title { font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#0f766e; margin-bottom:4px; font-weight:700; }
    .party-name { font-size:13px; font-weight:700; margin-bottom:2px; }
    .items th, .items td { padding:9px 7px; border-bottom:1px solid #ccfbf1; vertical-align:top; }
    .items tbody tr:nth-child(even) { background:#f8fffc; }
    .totals td { padding:6px 0; }
    .totals .grand td { padding-top:10px; border-top:2px solid ${ACCENT}; font-size:14px; }
  `;

  return renderHtmlDocument({
    title: `Invoice ${model.invoiceNumber}`,
    styles,
    body,
  });
}

export const modernInvoiceTemplate: InvoicePdfTemplate = {
  id: 'modern',
  name: 'Modern',
  description: 'Bold header with a clear totals panel and contemporary spacing.',
  accentColor: ACCENT,
  renderHtml: renderModernHtml,
};

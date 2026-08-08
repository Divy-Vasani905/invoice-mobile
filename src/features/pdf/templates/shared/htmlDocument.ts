import { escapeHtml } from '../../utils/pdfFormatting';

import type { InvoicePdfDocumentModel } from '../../types/pdf.types';

export function renderHtmlDocument(options: {
  title: string;
  styles: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
  <style>
    @page { margin: 24px; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.45;
      background: #ffffff;
    }
    img { max-width: 100%; }
    table { width: 100%; border-collapse: collapse; }
    .page { padding: 8px 4px 24px; }
    .muted { color: #6b7280; }
    .strong { font-weight: 700; }
    .right { text-align: right; }
    .left { text-align: left; }
    .center { text-align: center; }
    .wrap { word-break: break-word; overflow-wrap: anywhere; }
    .avoid-break { break-inside: avoid; page-break-inside: avoid; }
    .mt-8 { margin-top: 8px; }
    .mt-12 { margin-top: 12px; }
    .mt-16 { margin-top: 16px; }
    .mt-24 { margin-top: 24px; }
    .mb-8 { margin-bottom: 8px; }
    .mb-16 { margin-bottom: 16px; }
    ${options.styles}
  </style>
</head>
<body>
  <div class="page">
    ${options.body}
  </div>
</body>
</html>`;
}

export function renderPartyBlock(
  title: string,
  party: InvoicePdfDocumentModel['business'] | InvoicePdfDocumentModel['customer'],
): string {
  const lines = [
    party.companyName,
    ...party.addressLines,
    party.phone,
    party.email,
    party.website,
    party.taxId != null && party.taxId.length > 0 ? `Tax ID: ${party.taxId}` : undefined,
  ].filter((value): value is string => value != null && value.length > 0);

  return `<div class="party avoid-break">
    <div class="party-title">${escapeHtml(title)}</div>
    <div class="party-name wrap">${escapeHtml(party.name)}</div>
    ${lines.map((line) => `<div class="muted wrap">${escapeHtml(line)}</div>`).join('')}
  </div>`;
}

export function renderItemsTable(
  model: InvoicePdfDocumentModel,
  options?: { showTaxColumn?: boolean; headerBackground?: string },
): string {
  const showTax = options?.showTaxColumn ?? true;
  const headerBackground = options?.headerBackground ?? '#111827';
  const rows = model.items
    .map((item) => {
      const description = `<div class="wrap strong">${escapeHtml(item.description)}</div>${
        item.details != null ? `<div class="muted wrap">${escapeHtml(item.details)}</div>` : ''
      }${
        item.discountLabel != null
          ? `<div class="muted">Disc. ${escapeHtml(item.discountLabel)}</div>`
          : ''
      }`;
      return `<tr>
        <td class="wrap">${description}</td>
        <td class="center">${escapeHtml(item.quantityLabel)}</td>
        <td class="center">${escapeHtml(item.unitLabel)}</td>
        <td class="right">${escapeHtml(item.unitPriceLabel)}</td>
        ${showTax ? `<td class="right">${escapeHtml(item.taxLabel ?? '—')}</td>` : ''}
        <td class="right strong">${escapeHtml(item.lineTotalLabel)}</td>
      </tr>`;
    })
    .join('');

  return `<table class="items">
    <thead>
      <tr style="background:${headerBackground};color:#fff;">
        <th class="left">Description</th>
        <th>Qty</th>
        <th>Unit</th>
        <th class="right">Rate</th>
        ${showTax ? '<th class="right">Tax</th>' : ''}
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${
        rows.length > 0
          ? rows
          : `<tr><td colspan="${showTax ? 6 : 5}" class="muted center">No line items</td></tr>`
      }
    </tbody>
  </table>`;
}

export function renderTotals(model: InvoicePdfDocumentModel, accent = '#111827'): string {
  const rows = [
    ['Subtotal', model.totals.subtotalLabel],
    ['Discount', model.totals.discountLabel],
    ['Tax', model.totals.taxLabel],
    ['Round Off', model.totals.roundOffLabel],
  ];
  if (model.totals.paidLabel != null) {
    rows.push(['Paid', model.totals.paidLabel]);
  }
  if (model.totals.balanceLabel != null) {
    rows.push(['Balance', model.totals.balanceLabel]);
  }

  return `<div class="totals avoid-break">
    <table>
      ${rows
        .map((row) => {
          const [label, value] = row;
          return `<tr>
          <td class="muted">${escapeHtml(label ?? '')}</td>
          <td class="right">${escapeHtml(value ?? '')}</td>
        </tr>`;
        })
        .join('')}
      <tr class="grand">
        <td class="strong" style="color:${accent}">Grand Total</td>
        <td class="right strong" style="color:${accent}">${escapeHtml(model.totals.grandTotalLabel)}</td>
      </tr>
    </table>
  </div>`;
}

export function renderNotes(model: InvoicePdfDocumentModel): string {
  const blocks: string[] = [];
  if (model.notes != null && model.notes.trim().length > 0) {
    blocks.push(`<div class="avoid-break mt-16">
      <div class="strong mb-8">Notes</div>
      <div class="wrap muted">${escapeHtml(model.notes)}</div>
    </div>`);
  }
  if (model.terms != null && model.terms.trim().length > 0) {
    blocks.push(`<div class="avoid-break mt-12">
      <div class="strong mb-8">Terms</div>
      <div class="wrap muted">${escapeHtml(model.terms)}</div>
    </div>`);
  }
  return blocks.join('');
}

export function renderSignature(model: InvoicePdfDocumentModel): string {
  if (model.business.signatureDataUri == null) return '';
  return `<div class="signature avoid-break mt-24">
    <div class="muted mb-8">Authorized Signature</div>
    <img src="${model.business.signatureDataUri}" alt="Signature" style="max-height:64px;max-width:180px;" />
    <div class="muted mt-8">${escapeHtml(model.business.name)}</div>
  </div>`;
}

export function renderFooter(model: InvoicePdfDocumentModel): string {
  return `<div class="footer muted center mt-24">${escapeHtml(model.footerText)}</div>`;
}

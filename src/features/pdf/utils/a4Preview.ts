/** CSS pixel size of a single A4 page (210mm × 297mm at ~96dpi). */
export const A4_CSS_WIDTH_PX = 794;
export const A4_CSS_HEIGHT_PX = Math.round((A4_CSS_WIDTH_PX * 297) / 210);

/**
 * Preview-only wrapper. Does not change template HTML used by expo-print.
 * Locks the document to a fixed A4 CSS size so the WebView cannot reflow it
 * as a mobile webpage.
 */
export function prepareInvoiceHtmlForA4Preview(html: string): string {
  if (html.length === 0) return html;

  const viewport = `<meta name="viewport" content="width=${A4_CSS_WIDTH_PX}, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />`;
  const withViewport = /<meta\s+name=["']viewport["'][^>]*>/i.test(html)
    ? html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, viewport)
    : html.replace(/<\/head>/i, `${viewport}</head>`);

  const lockCss = `<style id="invoice-a4-preview-lock">
    html, body {
      width: ${A4_CSS_WIDTH_PX}px !important;
      min-width: ${A4_CSS_WIDTH_PX}px !important;
      max-width: ${A4_CSS_WIDTH_PX}px !important;
      min-height: ${A4_CSS_HEIGHT_PX}px !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden !important;
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }
    .page {
      width: ${A4_CSS_WIDTH_PX}px !important;
      min-height: ${A4_CSS_HEIGHT_PX}px !important;
    }
  </style>`;

  return /<\/head>/i.test(withViewport)
    ? withViewport.replace(/<\/head>/i, `${lockCss}</head>`)
    : `${lockCss}${withViewport}`;
}

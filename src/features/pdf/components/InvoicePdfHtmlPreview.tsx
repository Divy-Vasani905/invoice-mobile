import { memo, useCallback, useMemo, useState } from 'react';
import { Platform, ScrollView, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { useTheme } from '@/theme';

import { INVOICE_PDF_PAPER_BACKGROUND } from '../templates/shared/htmlDocument';
import {
  A4_CSS_HEIGHT_PX,
  A4_CSS_WIDTH_PX,
  prepareInvoiceHtmlForA4Preview,
} from '../utils/a4Preview';

/** Chrome around the scaled A4 page. Does not change invoice/PDF margins. */
const PREVIEW_PAGE_PADDING = 5;
/** Whitespace inside the A4 page. Invoice is uniformly scaled to fit. */
const PREVIEW_INNER_PADDING = 12;

type InvoicePdfHtmlPreviewProps = {
  html: string;
  accessibilityLabel: string;
};

type PreviewViewport = {
  width: number;
  height: number;
};

/**
 * Renders the same invoice HTML used by PDF generation as a fixed A4 page,
 * then scales that page uniformly to the preview width.
 */
export const InvoicePdfHtmlPreview = memo(function InvoicePdfHtmlPreview({
  html,
  accessibilityLabel,
}: InvoicePdfHtmlPreviewProps) {
  const { theme } = useTheme();
  const [viewport, setViewport] = useState<PreviewViewport>({ width: 0, height: 0 });

  const preparedHtml = useMemo(() => prepareInvoiceHtmlForA4Preview(html), [html]);
  const contentWidth = Math.max(0, viewport.width - PREVIEW_PAGE_PADDING * 2);
  const contentHeight = Math.max(0, viewport.height - PREVIEW_PAGE_PADDING * 2);
  const pageScale = contentWidth > 0 ? contentWidth / A4_CSS_WIDTH_PX : 0;
  const innerScale = (A4_CSS_WIDTH_PX - PREVIEW_INNER_PADDING * 2) / A4_CSS_WIDTH_PX;
  const documentScale = pageScale * innerScale;
  const scaledWidth = A4_CSS_WIDTH_PX * pageScale;
  const scaledHeight = A4_CSS_HEIGHT_PX * pageScale;
  const pageFitsVertically = pageScale > 0 && scaledHeight <= contentHeight;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport((current) =>
      current.width === width && current.height === height ? current : { width, height },
    );
  }, []);

  const pageFrameStyle: ViewStyle = {
    width: scaledWidth,
    height: scaledHeight,
    overflow: 'hidden',
    backgroundColor: INVOICE_PDF_PAPER_BACKGROUND,
    borderRadius: theme.cards.layout.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.elevation.sm,
  };

  const documentStyle: ViewStyle = {
    width: A4_CSS_WIDTH_PX,
    height: A4_CSS_HEIGHT_PX,
    backgroundColor: INVOICE_PDF_PAPER_BACKGROUND,
    transform: [{ scale: documentScale }],
    marginLeft: (scaledWidth - A4_CSS_WIDTH_PX) / 2,
    marginTop: (scaledHeight - A4_CSS_HEIGHT_PX) / 2,
  };

  return (
    <View
      accessible={false}
      onLayout={handleLayout}
      style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      {pageScale <= 0 ? null : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            width: viewport.width,
            minHeight: viewport.height,
            padding: PREVIEW_PAGE_PADDING,
            alignItems: 'center',
            justifyContent: pageFitsVertically ? 'center' : 'flex-start',
          }}
          scrollEnabled={!pageFitsVertically}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={!pageFitsVertically}
          bounces={false}
          nestedScrollEnabled={false}
        >
          <View collapsable={false} style={pageFrameStyle}>
            <View collapsable={false} style={documentStyle}>
              {Platform.OS === 'web' ? (
                <iframe
                  title={accessibilityLabel}
                  srcDoc={preparedHtml}
                  style={{
                    border: 'none',
                    width: A4_CSS_WIDTH_PX,
                    height: A4_CSS_HEIGHT_PX,
                    backgroundColor: INVOICE_PDF_PAPER_BACKGROUND,
                  }}
                />
              ) : (
                <WebView
                  accessibilityLabel={accessibilityLabel}
                  originWhitelist={['*']}
                  source={{ html: preparedHtml }}
                  scrollEnabled={false}
                  scalesPageToFit={false}
                  textZoom={100}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  setSupportMultipleWindows={false}
                  androidLayerType="hardware"
                  style={{
                    width: A4_CSS_WIDTH_PX,
                    height: A4_CSS_HEIGHT_PX,
                    backgroundColor: INVOICE_PDF_PAPER_BACKGROUND,
                  }}
                />
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
});

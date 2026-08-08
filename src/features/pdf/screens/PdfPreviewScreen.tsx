import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter } from 'expo-router';
import { memo, useCallback, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { showToast } from '@/components/feedback/Toast';
import { ThemedText } from '@/components/themed-text';
import { useInvoices } from '@/features/invoice/hooks/useInvoices';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { PdfActionBar } from '../components/PdfActionBar';
import { useInvoicePdf } from '../hooks/useInvoicePdf';
import { PdfUserCancelledError } from '../types/pdf.types';

export interface PdfPreviewScreenProps {
  invoiceId: string;
}

export const PdfPreviewScreen = memo(function PdfPreviewScreen({
  invoiceId,
}: PdfPreviewScreenProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { invoice, isLoading: isInvoiceLoading } = useInvoices(invoiceId);
  const { pdf, error, isGenerating, isSharing, isPrinting, generate, share, print } =
    useInvoicePdf(invoiceId);

  useEffect(() => {
    void generate().catch(() => {
      // Error state is surfaced in the UI.
    });
  }, [generate]);

  const handleRetry = useCallback(() => {
    void generate({ force: true }).catch(() => undefined);
  }, [generate]);

  const handleShare = useCallback(async () => {
    try {
      const result = await share();
      if (result != null) {
        showToast('success', { title: 'Invoice ready to share.' });
      }
    } catch (err) {
      if (err instanceof PdfUserCancelledError) return;
      showToast('error', {
        title: 'Unable to share invoice PDF',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  }, [share]);

  const handlePrint = useCallback(async () => {
    try {
      await print();
    } catch (err) {
      if (err instanceof PdfUserCancelledError) return;
      showToast('error', {
        title: 'Unable to print invoice PDF',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  }, [print]);

  if (isInvoiceLoading && invoice == null) {
    return <Loader mode="fullScreen" text="Loading invoice" />;
  }

  if (invoice == null) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This invoice may have been deleted."
        primaryAction={{ label: 'Go back', onPress: () => router.back() }}
      />
    );
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: `${invoice.invoiceNumber} PDF` }} />

      <View style={[cStyle.flex1, { paddingBottom: insets.bottom + cStyleValues.spacing.md }]}>
        {isGenerating && pdf == null ? (
          <Loader mode="fullScreen" text="Preparing invoice…" />
        ) : error != null && pdf == null ? (
          <EmptyState
            title="Unable to create invoice PDF"
            description={error}
            icon={({ color, size }) => (
              <Ionicons name="alert-circle-outline" color={color} size={size} />
            )}
            primaryAction={{ label: 'Retry', onPress: handleRetry }}
            secondaryAction={{ label: 'Go back', onPress: () => router.back() }}
          />
        ) : pdf != null ? (
          <>
            <View
              style={[
                cStyle.flex1,
                {
                  marginHorizontal: cStyleValues.spacing.lg,
                  marginTop: cStyleValues.spacing.md,
                  borderRadius: theme.cards.layout.radius,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              {Platform.OS === 'web' ? (
                <iframe
                  title={`PDF preview ${invoice.invoiceNumber}`}
                  src={pdf.uri}
                  style={{ border: 'none', width: '100%', height: '100%' }}
                />
              ) : (
                <WebView
                  source={{ uri: pdf.uri }}
                  originWhitelist={['*']}
                  allowFileAccess
                  allowUniversalAccessFromFileURLs
                  style={{ flex: 1, backgroundColor: theme.colors.surface }}
                  startInLoadingState
                  renderLoading={() => <Loader text="Loading PDF preview" />}
                />
              )}
            </View>
            <View
              style={{
                paddingHorizontal: cStyleValues.spacing.lg,
                paddingTop: cStyleValues.spacing.md,
              }}
            >
              <ThemedText
                style={[
                  theme.typography.caption,
                  { color: theme.colors.textSecondary, marginBottom: 8 },
                ]}
              >
                Template: {pdf.templateId}
                {pdf.numberOfPages != null ? ` · ${pdf.numberOfPages} page(s)` : ''}
              </ThemedText>
              <PdfActionBar
                showGenerate
                isGenerating={isGenerating}
                isSharing={isSharing}
                isPrinting={isPrinting}
                onGenerate={handleRetry}
                onShare={handleShare}
                onPrint={handlePrint}
              />
            </View>
          </>
        ) : (
          <Loader mode="fullScreen" text="Preparing invoice…" />
        )}
      </View>
    </View>
  );
});

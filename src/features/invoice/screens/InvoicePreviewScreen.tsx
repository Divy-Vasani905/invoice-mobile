import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { Modal } from '@/components/feedback/Modal';
import { showToast } from '@/components/feedback/Toast';
import { ThemedText } from '@/components/themed-text';
import { PdfActionBar } from '@/features/pdf/components/PdfActionBar';
import { useInvoicePdf } from '@/features/pdf/hooks/useInvoicePdf';
import { PdfUserCancelledError } from '@/features/pdf/types/pdf.types';
import { formatSavedTaxLabel } from '@/features/tax/utils/tax.utils';
import { ROUTES } from '@/navigation';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';
import { InvoiceStatus } from '@/types/models';

import { InvoiceSummary } from '../components/InvoiceSummary';
import { useInvoices } from '../hooks/useInvoices';
import {
  formatAddress,
  formatInvoiceDate,
  formatMoney,
  getProductUnitLabel,
  mapInvoiceStatus,
  resolveEffectiveStatus,
  toBadgeVariant,
} from '../utils/invoice.utils';

export interface InvoicePreviewScreenProps {
  invoiceId: string;
}

export const InvoicePreviewScreen = memo(function InvoicePreviewScreen({
  invoiceId,
}: InvoicePreviewScreenProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const {
    invoice,
    deleteInvoice,
    duplicateInvoice,
    markInvoicePaid,
    isLoading,
    isDeleting,
    isDuplicating,
    isSaving,
    isError,
    refreshInvoices,
    InsufficientInvoiceCreditsError,
  } = useInvoices(invoiceId);
  const { isGenerating, isSharing, isPrinting, share, print } = useInvoicePdf(invoiceId);

  const effectiveStatus = useMemo(
    () => (invoice == null ? null : resolveEffectiveStatus(invoice)),
    [invoice],
  );
  const displayStatus = effectiveStatus == null ? null : mapInvoiceStatus(effectiveStatus);
  const badgeVariant = displayStatus == null ? 'neutral' : toBadgeVariant(displayStatus);

  const openEdit = useCallback(() => {
    router.push(ROUTES.editInvoice(invoiceId));
  }, [invoiceId, router]);

  const openPdfPreview = useCallback(() => {
    router.push(ROUTES.invoicePdfPreview(invoiceId));
  }, [invoiceId, router]);

  const handleSharePdf = useCallback(async () => {
    try {
      const result = await share();
      if (result != null) {
        showToast('success', { title: 'Invoice ready to share.' });
      }
    } catch (error) {
      if (error instanceof PdfUserCancelledError) return;
      showToast('error', {
        title: 'Unable to share invoice PDF',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  }, [share]);

  const handlePrintPdf = useCallback(async () => {
    try {
      await print();
    } catch (error) {
      if (error instanceof PdfUserCancelledError) return;
      showToast('error', {
        title: 'Unable to print invoice PDF',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  }, [print]);

  const handleDuplicate = useCallback(async () => {
    try {
      const duplicated = await duplicateInvoice(invoiceId);
      showToast('success', { title: 'Invoice duplicated' });
      router.replace(ROUTES.editInvoice(duplicated.id));
    } catch (error) {
      if (error instanceof InsufficientInvoiceCreditsError) {
        showToast('error', {
          title: 'No invoices remaining',
          message: error.message,
        });
        return;
      }
      showToast('error', {
        title: 'Could not duplicate invoice',
        message: 'Please try again.',
      });
    }
  }, [InsufficientInvoiceCreditsError, duplicateInvoice, invoiceId, router]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteInvoice(invoiceId);
      setShowDeleteConfirmation(false);
      showToast('success', { title: 'Invoice deleted' });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(ROUTES.invoices);
      }
    } catch {
      setShowDeleteConfirmation(false);
      showToast('error', {
        title: 'Could not delete invoice',
        message: 'Please try again.',
      });
    }
  }, [deleteInvoice, invoiceId, router]);

  const handleMarkPaid = useCallback(async () => {
    try {
      await markInvoicePaid(invoiceId);
      showToast('success', { title: 'Marked as paid' });
    } catch {
      showToast('error', {
        title: 'Could not update status',
        message: 'Please try again.',
      });
    }
  }, [invoiceId, markInvoicePaid]);

  if (isLoading && invoice == null) {
    return <Loader mode="fullScreen" text="Loading invoice" />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Unable to load invoice"
        description="This invoice could not be loaded."
        primaryAction={{ label: 'Retry', onPress: refreshInvoices }}
      />
    );
  }

  if (invoice == null) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This invoice may have been deleted."
        primaryAction={{
          label: 'Back to Invoices',
          onPress: () => router.replace(ROUTES.invoices),
        }}
      />
    );
  }

  const canMarkPaid =
    effectiveStatus !== InvoiceStatus.Paid &&
    effectiveStatus !== InvoiceStatus.Draft &&
    effectiveStatus !== InvoiceStatus.Cancelled;

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: invoice.invoiceNumber,
          headerRight: () =>
            displayStatus == null ? null : (
              <Badge label={displayStatus.toUpperCase()} variant={badgeVariant} size="sm" />
            ),
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: cStyleValues.spacing.lg,
          paddingTop: cStyleValues.spacing.md,
          paddingBottom: insets.bottom + cStyleValues.spacing['4xl'],
          gap: cStyleValues.spacing.lg,
        }}
      >
        <View
          style={{
            padding: cStyleValues.spacing.lg,
            borderRadius: theme.cards.layout.radius,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            gap: cStyleValues.spacing.lg,
          }}
        >
          <View style={[cStyle.flexRow, cStyle.justifyBetween, cStyle.itemStart, cStyle.g12]}>
            <View style={[cStyle.flex1, cStyle.g8]}>
              {invoice.business.logoUri != null && invoice.business.logoUri.length > 0 ? (
                <Image
                  source={{ uri: invoice.business.logoUri }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: theme.cards.layout.radius,
                  }}
                  contentFit="contain"
                  accessibilityLabel={`${invoice.business.name} logo`}
                />
              ) : null}
              <ThemedText style={[theme.typography.headingL, { color: theme.colors.textPrimary }]}>
                {invoice.business.name || 'Business'}
              </ThemedText>
              {formatAddress(invoice.business.address).length > 0 ? (
                <ThemedText
                  style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                >
                  {formatAddress(invoice.business.address)}
                </ThemedText>
              ) : null}
              {[invoice.business.email, invoice.business.phone, invoice.business.taxId]
                .filter((value): value is string => value != null && value.length > 0)
                .map((value) => (
                  <ThemedText
                    key={value}
                    style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                  >
                    {value}
                  </ThemedText>
                ))}
            </View>
            <View style={[cStyle.itemEnd, cStyle.g4]}>
              <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
                {invoice.invoiceNumber}
              </ThemedText>
              <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Issued {formatInvoiceDate(invoice.issuedAt)}
              </ThemedText>
              {invoice.dueAt != null ? (
                <ThemedText
                  style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                >
                  Due {formatInvoiceDate(invoice.dueAt)}
                </ThemedText>
              ) : null}
            </View>
          </View>

          <Divider />

          <View style={[cStyle.g8]}>
            <ThemedText style={[theme.typography.label, { color: theme.colors.textSecondary }]}>
              Bill To
            </ThemedText>
            <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
              {invoice.customer.name || 'No customer'}
            </ThemedText>
            {invoice.customer.companyName != null && invoice.customer.companyName.length > 0 ? (
              <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {invoice.customer.companyName}
              </ThemedText>
            ) : null}
            {formatAddress(invoice.customer.address).length > 0 ? (
              <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {formatAddress(invoice.customer.address)}
              </ThemedText>
            ) : null}
            {[invoice.customer.email, invoice.customer.phone, invoice.customer.taxId]
              .filter((value): value is string => value != null && value.length > 0)
              .map((value) => (
                <ThemedText
                  key={value}
                  style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                >
                  {value}
                </ThemedText>
              ))}
          </View>

          <Divider />

          <View style={[cStyle.g12]}>
            <ThemedText style={[theme.typography.label, { color: theme.colors.textSecondary }]}>
              Items
            </ThemedText>
            {(invoice.items ?? []).map((item) => (
              <View key={item.id} style={[cStyle.g4]}>
                <View style={[cStyle.flexRow, cStyle.justifyBetween, cStyle.itemStart]}>
                  <View style={[cStyle.flex1, { paddingRight: cStyleValues.spacing.md }]}>
                    <ThemedText
                      style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
                    >
                      {item.product.name}
                    </ThemedText>
                    {item.product.description != null && item.product.description.length > 0 ? (
                      <ThemedText
                        style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                      >
                        {item.product.description}
                      </ThemedText>
                    ) : null}
                    <ThemedText
                      style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                    >
                      {item.quantity} {getProductUnitLabel(item.product.unit)} ×{' '}
                      {formatMoney(item.unitPrice.amountMinor, invoice.currencyCode)}
                      {invoice.appliedTax === undefined && item.taxRateBasisPoints > 0
                        ? ` · Tax ${item.taxRateBasisPoints / 100}%`
                        : ''}
                      {item.discountAmount.amountMinor > 0
                        ? ` · Disc. ${formatMoney(item.discountAmount.amountMinor, invoice.currencyCode)}`
                        : ''}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
                  >
                    {formatMoney(item.totalAmount.amountMinor, invoice.currencyCode)}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          <InvoiceSummary
            currencyCode={invoice.currencyCode}
            subtotalMinor={invoice.totals.subtotalAmount.amountMinor}
            discountMinor={invoice.totals.discountAmount.amountMinor}
            taxMinor={invoice.totals.taxAmount.amountMinor}
            taxLabel={
              invoice.appliedTax != null ? formatSavedTaxLabel(invoice.appliedTax) : 'Tax'
            }
            roundOffMinor={invoice.totals.roundOffAmount?.amountMinor ?? 0}
            grandTotalMinor={invoice.totals.totalAmount.amountMinor}
          />

          {invoice.notes != null && invoice.notes.trim().length > 0 ? (
            <View style={[cStyle.g8]}>
              <ThemedText style={[theme.typography.label, { color: theme.colors.textSecondary }]}>
                Notes
              </ThemedText>
              <ThemedText
                style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
              >
                {invoice.notes}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={[cStyle.g12]}>
          <PdfActionBar
            isGenerating={isGenerating}
            isSharing={isSharing}
            isPrinting={isPrinting}
            onGenerate={openPdfPreview}
            onShare={handleSharePdf}
            onPrint={handlePrintPdf}
          />
          <Button
            label="Edit"
            leftIcon={({ color, size }) => (
              <Ionicons name="create-outline" color={color} size={size} />
            )}
            onPress={openEdit}
            accessibilityLabel="Edit invoice"
            disabled={isGenerating || isSharing || isPrinting}
          />
          {canMarkPaid ? (
            <Button
              label="Mark as Paid"
              variant="secondary"
              loading={isSaving}
              onPress={handleMarkPaid}
              accessibilityLabel="Mark invoice as paid"
            />
          ) : null}
          <Button
            label="Duplicate"
            variant="secondary"
            loading={isDuplicating}
            leftIcon={({ color, size }) => (
              <Ionicons name="copy-outline" color={color} size={size} />
            )}
            onPress={handleDuplicate}
            accessibilityLabel="Duplicate invoice"
            accessibilityHint="Creates a new draft copy with a new invoice number"
          />
          <Button
            label="Delete"
            variant="danger"
            leftIcon={({ color, size }) => (
              <Ionicons name="trash-outline" color={color} size={size} />
            )}
            onPress={() => setShowDeleteConfirmation(true)}
            accessibilityLabel="Delete invoice"
          />
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteConfirmation}
        onRequestClose={() => setShowDeleteConfirmation(false)}
        variant="destructive"
        title="Delete Invoice?"
        description={`Are you sure you want to delete ${invoice.invoiceNumber}?`}
        primaryAction={{
          label: 'Delete',
          loading: isDeleting,
          onPress: handleDelete,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setShowDeleteConfirmation(false),
        }}
      />
    </View>
  );
});

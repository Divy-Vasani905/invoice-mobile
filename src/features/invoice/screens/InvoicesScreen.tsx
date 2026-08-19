import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { SearchInput } from '@/components/form/SearchInput';
import { Header } from '@/components/layout/Header';
import { SegmentControl } from '@/components/layout/SegmentControl';
import { InvoiceUsageModal, useCreateInvoiceNavigation } from '@/features/credits';
import { ROUTES } from '@/navigation';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { InvoiceListCard } from '../components/InvoiceListCard';
import { useInvoices } from '../hooks/useInvoices';

import type { InvoiceListFilter, InvoiceListItem } from '../types/invoice.types';

const FILTER_OPTIONS: { label: string; value: InvoiceListFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Draft', value: 'draft' },
];

export const InvoicesScreen = memo(function InvoicesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { openCreateInvoice, usageModalProps } = useCreateInvoiceNavigation();
  const {
    invoices,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    refreshInvoices,
    isLoading,
    isRefreshing,
    isEmpty,
    hasNoSearchResults,
    isError,
  } = useInvoices();

  const openInvoice = useCallback(
    (invoiceId: string) => router.push(ROUTES.invoicePreview(invoiceId)),
    [router],
  );
  const renderInvoice = useCallback(
    ({ item }: { item: InvoiceListItem }) => <InvoiceListCard item={item} onPress={openInvoice} />,
    [openInvoice],
  );
  const keyExtractor = useCallback((item: InvoiceListItem) => item.invoice.id, []);
  const listHeader = useMemo(
    () => (
      <View style={[cStyle.g12, cStyle.mb8]}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search invoices"
          accessibilityLabel="Search invoices"
          accessibilityHint="Search by invoice number or customer name"
        />
        <SegmentControl
          options={FILTER_OPTIONS}
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as InvoiceListFilter)}
          scrollable
        />
      </View>
    ),
    [searchQuery, setSearchQuery, setStatusFilter, statusFilter],
  );

  if (isLoading) return <Loader mode="fullScreen" text="Loading invoices" />;
  if (isError) {
    return (
      <EmptyState
        title="Unable to load invoices"
        description="Your invoice list could not be loaded."
        primaryAction={{ label: 'Retry', onPress: refreshInvoices }}
      />
    );
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Invoices"
        rightActions={
          <Button
            label="New Invoice"
            style={{ paddingHorizontal: cStyleValues.spacing.md }}
            leftIcon={({ color, size }) => <Ionicons name="add" color={color} size={size} />}
            onPress={openCreateInvoice}
            accessibilityLabel="Create invoice"
            accessibilityHint="Opens the create invoice form"
          />
        }
      />
      <FlatList
        data={invoices}
        renderItem={renderInvoice}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: cStyleValues.spacing.lg,
          paddingTop: cStyleValues.spacing.md,
          paddingBottom: cStyleValues.spacing['7xl'],
        }}
        ListEmptyComponent={
          <EmptyState
            variant={hasNoSearchResults ? 'search' : 'default'}
            title={hasNoSearchResults ? 'No matching invoices' : 'No invoices yet'}
            description={
              hasNoSearchResults
                ? 'Try changing your search or filter.'
                : 'Create your first invoice to get started.'
            }
            icon={({ color, size }) => (
              <Ionicons
                name={hasNoSearchResults ? 'search-outline' : 'document-text-outline'}
                color={color}
                size={size}
              />
            )}
            primaryAction={
              isEmpty ? { label: 'New Invoice', onPress: openCreateInvoice } : undefined
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshInvoices}
            tintColor={theme.colors.primary}
          />
        }
      />

      <InvoiceUsageModal {...usageModalProps} />
    </View>
  );
});

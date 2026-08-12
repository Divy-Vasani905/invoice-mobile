import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import {
  INVOICE_CREDITS_QUERY_KEY,
  InsufficientInvoiceCreditsError,
  invoiceCreditFeatureRepository,
} from '@/features/credits';
import { AdMonetizationService } from '@/services/ads';
import { AnalyticsEvents, AnalyticsService } from '@/services/analytics';
import { isDeviceOnline } from '@/services/network/isDeviceOnline';
import { getMonetizationConfig } from '@/stores/remote-config/remote-config-store';

import {
  InvoiceValidationError,
  MissingBusinessError,
  invoiceFeatureRepository,
} from '../repositories/InvoiceRepository';

import type { InvoiceFormValues, InvoiceListFilter } from '../types/invoice.types';

export const INVOICES_QUERY_KEY = ['invoices'] as const;

async function assertInvoiceGenerationAllowed(): Promise<void> {
  if (!getMonetizationConfig().allowInvoiceGenerationWithoutInternet) {
    const online = await isDeviceOnline();
    if (!online) {
      throw new Error('Internet connection is required to create an invoice.');
    }
  }
  invoiceCreditFeatureRepository.assertCanCreateInvoice();
}

export function useInvoices(invoiceId?: string) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceListFilter>('all');

  const invoicesQuery = useQuery({
    queryKey: INVOICES_QUERY_KEY,
    queryFn: () => invoiceFeatureRepository.getInvoices(),
  });
  const { refetch } = invoicesQuery;

  const invalidateRelated = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['customers'] }),
      queryClient.invalidateQueries({ queryKey: INVOICE_CREDITS_QUERY_KEY }),
    ]);
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: async ({ values, asDraft }: { values: InvoiceFormValues; asDraft: boolean }) => {
      await assertInvoiceGenerationAllowed();
      const created = invoiceFeatureRepository.createInvoice(values, asDraft);
      invoiceCreditFeatureRepository.consumeCredit();
      return created;
    },
    onSuccess: async (_invoice, variables) => {
      await invalidateRelated();
      void AnalyticsService.logEvent(AnalyticsEvents.InvoiceCreated, {
        as_draft: variables.asDraft,
      });
      // Non-blocking: interstitial every N successful generations.
      AdMonetizationService.onSuccessfulInvoiceGenerated();
    },
  });
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
      asDraft,
    }: {
      id: string;
      values: InvoiceFormValues;
      asDraft: boolean;
    }) => invoiceFeatureRepository.updateInvoice(id, values, asDraft),
    onSuccess: async (_invoice, variables) => {
      await invalidateRelated();
      void AnalyticsService.logEvent(AnalyticsEvents.InvoiceUpdated, {
        as_draft: variables.asDraft,
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => invoiceFeatureRepository.deleteInvoice(id),
    onSuccess: async () => {
      await invalidateRelated();
      void AnalyticsService.logEvent(AnalyticsEvents.InvoiceDeleted);
    },
  });
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      await assertInvoiceGenerationAllowed();
      const duplicated = invoiceFeatureRepository.duplicateInvoice(id);
      invoiceCreditFeatureRepository.consumeCredit();
      return duplicated;
    },
    onSuccess: async () => {
      await invalidateRelated();
      void AnalyticsService.logEvent(AnalyticsEvents.InvoiceCreated, {
        as_draft: true,
        source: 'duplicate',
      });
      AdMonetizationService.onSuccessfulInvoiceGenerated();
    },
  });
  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => invoiceFeatureRepository.markInvoicePaid(id),
    onSuccess: async () => {
      await invalidateRelated();
      void AnalyticsService.logEvent(AnalyticsEvents.InvoiceUpdated, {
        as_draft: false,
        marked_paid: true,
      });
    },
  });

  const invoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data]);
  const filteredInvoices = useMemo(
    () => invoiceFeatureRepository.filterInvoices(invoices, searchQuery, statusFilter),
    [invoices, searchQuery, statusFilter],
  );

  const invoice = useMemo(() => {
    if (invoiceId == null) return undefined;
    return (
      invoices.find((item) => item.invoice.id === invoiceId)?.invoice ??
      invoiceFeatureRepository.getInvoiceById(invoiceId) ??
      undefined
    );
  }, [invoiceId, invoices]);

  const refreshInvoices = useCallback(() => refetch(), [refetch]);

  const getDefaultCreateFormValues = useCallback(
    () => invoiceFeatureRepository.getDefaultCreateFormValues(),
    [],
  );

  return {
    invoices: filteredInvoices,
    allInvoices: invoices,
    invoice,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    refreshInvoices,
    getDefaultCreateFormValues,
    createInvoice: createMutation.mutateAsync,
    updateInvoice: updateMutation.mutateAsync,
    deleteInvoice: deleteMutation.mutateAsync,
    duplicateInvoice: duplicateMutation.mutateAsync,
    markInvoicePaid: markPaidMutation.mutateAsync,
    isLoading: invoicesQuery.isLoading,
    isRefreshing: invoicesQuery.isRefetching && !invoicesQuery.isLoading,
    isEmpty: invoicesQuery.isSuccess && invoices.length === 0,
    hasNoSearchResults:
      invoicesQuery.isSuccess && invoices.length > 0 && filteredInvoices.length === 0,
    isError: invoicesQuery.isError,
    error: invoicesQuery.error,
    isSaving: createMutation.isPending || updateMutation.isPending || markPaidMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    MissingBusinessError,
    InvoiceValidationError,
    InsufficientInvoiceCreditsError,
  };
}

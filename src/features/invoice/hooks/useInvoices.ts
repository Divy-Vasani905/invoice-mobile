import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import {
  InvoiceValidationError,
  MissingBusinessError,
  invoiceFeatureRepository,
} from '../repositories/InvoiceRepository';

import type { InvoiceFormValues, InvoiceListFilter } from '../types/invoice.types';

export const INVOICES_QUERY_KEY = ['invoices'] as const;

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
    ]);
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: async ({ values, asDraft }: { values: InvoiceFormValues; asDraft: boolean }) =>
      invoiceFeatureRepository.createInvoice(values, asDraft),
    onSuccess: invalidateRelated,
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
    onSuccess: invalidateRelated,
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => invoiceFeatureRepository.deleteInvoice(id),
    onSuccess: invalidateRelated,
  });
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => invoiceFeatureRepository.duplicateInvoice(id),
    onSuccess: invalidateRelated,
  });
  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => invoiceFeatureRepository.markInvoicePaid(id),
    onSuccess: invalidateRelated,
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
  };
}

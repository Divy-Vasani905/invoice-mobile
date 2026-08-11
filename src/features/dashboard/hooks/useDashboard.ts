import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useCreateInvoiceNavigation } from '@/features/credits';
import { ROUTES } from '@/navigation';

import { DashboardRepository } from '../repositories/DashboardRepository';

import type { DashboardRecentMode } from '../types/dashboard.types';

const dashboardRepository = new DashboardRepository();

export function useDashboard() {
  const router = useRouter();
  const { openCreateInvoice, openUsageModal, usageModalProps } = useCreateInvoiceNavigation();
  const [recentMode, setRecentMode] = useState<DashboardRecentMode>('invoices');
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardRepository.get(),
  });
  const { refetch } = query;

  const actions = useMemo(
    () => ({
      createInvoice: openCreateInvoice,
      createProduct: () => router.push(ROUTES.createProduct),
      openBusinessProfile: () => router.push(ROUTES.businessProfile),
      openInvoice: (invoiceId: string) => router.push(ROUTES.invoicePreview(invoiceId)),
      openInvoices: () => router.push(ROUTES.invoices),
      openProduct: (productId: string) => router.push(ROUTES.editProduct(productId)),
      openProducts: () => router.push(ROUTES.products),
    }),
    [openCreateInvoice, router],
  );

  const openSeeAll = useCallback(() => {
    if (recentMode === 'products') {
      actions.openProducts();
      return;
    }
    actions.openInvoices();
  }, [actions, recentMode]);

  return {
    data: query.data,
    recentMode,
    setRecentMode,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isEmptyInvoices: query.data != null && query.data.recentInvoices.length === 0,
    isEmptyProducts: query.data != null && query.data.recentProducts.length === 0,
    isError: query.isError,
    error: query.error,
    refresh: useCallback(() => refetch(), [refetch]),
    openSeeAll,
    openUsageModal,
    usageModalProps,
    ...actions,
  };
}

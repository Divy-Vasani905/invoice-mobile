import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { ROUTES } from '@/navigation';

import { DashboardRepository } from '../repositories/DashboardRepository';

const dashboardRepository = new DashboardRepository();

export function useDashboard() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardRepository.get(),
  });

  const actions = useMemo(
    () => ({
      createInvoice: () => router.push(ROUTES.createInvoice),
      openBusinessProfile: () => router.push(ROUTES.businessProfile),
      openInvoice: (invoiceId: string) => router.push(ROUTES.invoiceDetails(invoiceId)),
      openInvoices: () => router.push(ROUTES.invoices),
    }),
    [router],
  );

  return {
    data: query.data,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    isEmpty: query.data != null && query.data.recentInvoices.length === 0,
    isError: query.isError,
    error: query.error,
    refresh: useCallback(() => query.refetch(), [query]),
    ...actions,
  };
}

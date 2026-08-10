import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { AnalyticsEvents, AnalyticsService } from '@/services/analytics';

import { customerFeatureRepository } from '../repositories/CustomerRepository';

import type { CustomerFormValues } from '../types/customer.types';

const CUSTOMERS_QUERY_KEY = ['customers'] as const;

export function useCustomers(customerId?: string) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const customersQuery = useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: () => customerFeatureRepository.getCustomers(),
  });
  const { refetch } = customersQuery;

  const refreshCustomers = useCallback(() => refetch(), [refetch]);
  const invalidateCustomers = useCallback(
    () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY }),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: async (values: CustomerFormValues) =>
      customerFeatureRepository.createCustomer(values),
    onSuccess: async () => {
      await invalidateCustomers();
      void AnalyticsService.logEvent(AnalyticsEvents.CustomerCreated);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: CustomerFormValues }) =>
      customerFeatureRepository.updateCustomer(id, values),
    onSuccess: invalidateCustomers,
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => customerFeatureRepository.deleteCustomer(id),
    onSuccess: invalidateCustomers,
  });

  const customers = useMemo(() => customersQuery.data ?? [], [customersQuery.data]);
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredCustomers = useMemo(() => {
    if (normalizedQuery.length === 0) return customers;
    return customers.filter(({ customer }) =>
      [customer.displayName, customer.companyName, customer.phone, customer.email].some((value) =>
        value?.toLocaleLowerCase().includes(normalizedQuery),
      ),
    );
  }, [customers, normalizedQuery]);
  const customer = useMemo(
    () =>
      customerId == null
        ? undefined
        : (customers.find((summary) => summary.customer.id === customerId)?.customer ??
          customerFeatureRepository.getCustomerById(customerId)),
    [customerId, customers],
  );

  return {
    customers: filteredCustomers,
    customer,
    searchQuery,
    setSearchQuery,
    refreshCustomers,
    createCustomer: createMutation.mutateAsync,
    updateCustomer: updateMutation.mutateAsync,
    deleteCustomer: deleteMutation.mutateAsync,
    isLoading: customersQuery.isLoading,
    isRefreshing: customersQuery.isRefetching && !customersQuery.isLoading,
    isEmpty: customersQuery.isSuccess && customers.length === 0,
    hasNoSearchResults:
      customersQuery.isSuccess && customers.length > 0 && filteredCustomers.length === 0,
    isError: customersQuery.isError,
    error: customersQuery.error,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

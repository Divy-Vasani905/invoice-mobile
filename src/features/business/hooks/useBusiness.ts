import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { AnalyticsEvents, AnalyticsService } from '@/services/analytics';

import { businessFeatureRepository } from '../repositories/BusinessRepository';

import type { BusinessFormValues } from '../types/business.types';

export const BUSINESS_QUERY_KEY = ['business'] as const;

export function useBusiness() {
  const queryClient = useQueryClient();
  const businessQuery = useQuery({
    queryKey: BUSINESS_QUERY_KEY,
    queryFn: () => businessFeatureRepository.getActiveBusinessSummary(),
  });
  const { refetch } = businessQuery;

  const invalidateBusiness = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: async (values: BusinessFormValues) =>
      businessFeatureRepository.createBusiness(values),
    onSuccess: async () => {
      await invalidateBusiness();
      void AnalyticsService.logEvent(AnalyticsEvents.BusinessProfileUpdated, {
        action: 'create',
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (values: BusinessFormValues) =>
      businessFeatureRepository.updateBusiness(values),
    onSuccess: async () => {
      await invalidateBusiness();
      void AnalyticsService.logEvent(AnalyticsEvents.BusinessProfileUpdated, {
        action: 'update',
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => businessFeatureRepository.deleteBusiness(),
    onSuccess: invalidateBusiness,
  });

  const summary = businessQuery.data ?? null;
  const businesses = useMemo(() => (summary == null ? [] : [summary]), [summary]);

  return {
    business: summary?.business ?? null,
    summary,
    businesses,
    refreshBusiness: useCallback(() => refetch(), [refetch]),
    createBusiness: createMutation.mutateAsync,
    updateBusiness: updateMutation.mutateAsync,
    deleteBusiness: deleteMutation.mutateAsync,
    getBusinessById: businessFeatureRepository.getBusinessById.bind(businessFeatureRepository),
    getActiveBusiness: businessFeatureRepository.getActiveBusiness.bind(businessFeatureRepository),
    setActiveBusiness: businessFeatureRepository.setActiveBusiness.bind(businessFeatureRepository),
    isLoading: businessQuery.isLoading,
    isRefreshing: businessQuery.isRefetching && !businessQuery.isLoading,
    isEmpty: businessQuery.isSuccess && summary == null,
    isError: businessQuery.isError,
    error: businessQuery.error,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

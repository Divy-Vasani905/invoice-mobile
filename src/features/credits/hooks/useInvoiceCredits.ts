import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { preloadAdsIfLowOnCredits } from '@/services/ads/preloadAds';
import { useRemoteConfigStore } from '@/stores/remote-config/remote-config-store';

import {
  InsufficientInvoiceCreditsError,
  invoiceCreditFeatureRepository,
} from '../repositories/InvoiceCreditRepository';
import { formatResetDate } from '../utils/credit.utils';

export const INVOICE_CREDITS_QUERY_KEY = ['invoice-credits'] as const;

export function useInvoiceCredits() {
  const queryClient = useQueryClient();
  const freeInvoicesPerMonth = useRemoteConfigStore(
    (s) => s.monetizationConfig.freeInvoicesPerMonth,
  );

  const creditsQuery = useQuery({
    queryKey: [...INVOICE_CREDITS_QUERY_KEY, freeInvoicesPerMonth],
    queryFn: () => invoiceCreditFeatureRepository.getSnapshot(),
  });

  const invalidateCredits = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: INVOICE_CREDITS_QUERY_KEY });
  }, [queryClient]);

  const consumeMutation = useMutation({
    mutationFn: async () => invoiceCreditFeatureRepository.consumeCredit(),
    onSuccess: async () => {
      await invalidateCredits();
    },
  });

  const snapshot = creditsQuery.data;
  const resetLabel = useMemo(
    () => (snapshot != null ? formatResetDate(snapshot.nextResetAt) : ''),
    [snapshot],
  );

  useEffect(() => {
    if (snapshot == null) return;
    preloadAdsIfLowOnCredits(snapshot.totalAvailable, snapshot.isPremium);
  }, [snapshot?.isPremium, snapshot?.totalAvailable]);

  return {
    snapshot,
    monthlyRemaining: snapshot?.monthlyRemaining ?? 0,
    purchasedCredits: snapshot?.purchasedCredits ?? 0,
    totalAvailable: snapshot?.totalAvailable ?? 0,
    isPremium: snapshot?.isPremium === true,
    hasAvailableCredits: snapshot?.hasAvailableCredits === true,
    resetLabel,
    isLoading: creditsQuery.isLoading,
    isError: creditsQuery.isError,
    refreshCredits: useCallback(() => creditsQuery.refetch(), [creditsQuery]),
    invalidateCredits,
    assertCanCreateInvoice: useCallback(() => {
      invoiceCreditFeatureRepository.assertCanCreateInvoice();
    }, []),
    consumeCredit: consumeMutation.mutateAsync,
    InsufficientInvoiceCreditsError,
  };
}

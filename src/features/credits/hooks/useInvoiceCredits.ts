import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import {
  InsufficientInvoiceCreditsError,
  invoiceCreditFeatureRepository,
} from '../repositories/InvoiceCreditRepository';
import { formatResetDate } from '../utils/credit.utils';

export const INVOICE_CREDITS_QUERY_KEY = ['invoice-credits'] as const;

export function useInvoiceCredits() {
  const queryClient = useQueryClient();

  const creditsQuery = useQuery({
    queryKey: INVOICE_CREDITS_QUERY_KEY,
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

import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { showToast } from '@/components/feedback/Toast';
import { useInvoiceCredits } from '@/features/credits';
import { ROUTES } from '@/navigation';

/**
 * Shared create-invoice navigation gate.
 * Blocks navigation when no credits remain; save path still enforces consumption.
 */
export function useCreateInvoiceNavigation() {
  const router = useRouter();
  const { snapshot } = useInvoiceCredits();

  const openCreateInvoice = useCallback(() => {
    const canCreate = snapshot == null || snapshot.hasAvailableCredits;
    if (!canCreate) {
      showToast('error', {
        title: 'No invoices remaining',
        message:
          "You've used all your free invoices for this month. Your free allowance will reset next month.",
      });
      return;
    }
    router.push(ROUTES.createInvoice);
  }, [router, snapshot]);

  return { openCreateInvoice };
}

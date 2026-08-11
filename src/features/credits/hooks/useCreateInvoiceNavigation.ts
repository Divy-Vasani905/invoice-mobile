import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useInvoiceCredits } from '@/features/credits/hooks/useInvoiceCredits';
import { useRewardedCreditOffer } from '@/features/credits/hooks/useRewardedCreditOffer';
import { formatResetDate } from '@/features/credits/utils/credit.utils';
import { ROUTES } from '@/navigation';

/**
 * Shared create-invoice navigation gate.
 * When credits are depleted, opens the usage/reward offer modal instead of navigating.
 */
export function useCreateInvoiceNavigation() {
  const router = useRouter();
  const { snapshot } = useInvoiceCredits();
  const [showUsageModal, setShowUsageModal] = useState(false);
  const rewarded = useRewardedCreditOffer();

  const openUsageModal = useCallback(() => {
    rewarded.refreshDailyStatus();
    setShowUsageModal(true);
  }, [rewarded]);

  const openCreateInvoice = useCallback(() => {
    const canCreate = snapshot == null || snapshot.hasAvailableCredits;
    if (!canCreate) {
      openUsageModal();
      return;
    }
    router.push(ROUTES.createInvoice);
  }, [openUsageModal, router, snapshot]);

  const closeUsageModal = useCallback(() => {
    setShowUsageModal(false);
  }, []);

  const openPremium = useCallback(() => {
    setShowUsageModal(false);
    router.push(ROUTES.premium);
  }, [router]);

  const watchAdForCredit = useCallback(async () => {
    await rewarded.watchAdForCredit();
    // Keep modal open so purchased / total / daily counts refresh in place.
  }, [rewarded]);

  const activeSnapshot = rewarded.snapshot ?? snapshot;
  const resetLabel = activeSnapshot != null ? formatResetDate(activeSnapshot.nextResetAt) : '';

  return {
    openCreateInvoice,
    showUsageModal,
    closeUsageModal,
    openUsageModal,
    openPremium,
    usageModalProps: {
      visible: showUsageModal,
      snapshot: activeSnapshot,
      resetLabel,
      onRequestClose: closeUsageModal,
      canWatchRewarded: rewarded.canWatchRewarded,
      isWatchingAd: rewarded.isWatchingAd,
      rewardedDaily: rewarded.rewardedDaily,
      onWatchAd: watchAdForCredit,
      onPremiumPress: openPremium,
    },
  };
}

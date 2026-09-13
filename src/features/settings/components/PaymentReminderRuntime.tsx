import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { ROUTES } from '@/navigation';
import {
  subscribeToPaymentReminderActions,
  syncPaymentRemindersForAllInvoices,
} from '@/services/notifications';
import { useUserPreferencesStore } from '@/stores/user-preferences';

/**
 * Keeps local Payment Reminders synchronized with preferences, currency, and OS permissions.
 * Listens for notification actions ("View Invoice", "Call Client").
 */
export function PaymentReminderRuntime() {
  const router = useRouter();
  const onboardingCompleted = useUserPreferencesStore((state) => state.onboardingCompleted);

  useEffect(() => {
    if (!onboardingCompleted) return;

    void syncPaymentRemindersForAllInvoices();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncPaymentRemindersForAllInvoices();
      }
    });

    const unsubscribeStore = useUserPreferencesStore.subscribe((state, prevState) => {
      if (
        state.paymentReminderSettings !== prevState.paymentReminderSettings ||
        state.currencyCode !== prevState.currencyCode
      ) {
        void syncPaymentRemindersForAllInvoices();
      }
    });

    const unsubscribeActions = subscribeToPaymentReminderActions((invoiceId) => {
      router.push(ROUTES.invoicePreview(invoiceId));
    });

    return () => {
      appStateSubscription.remove();
      unsubscribeStore();
      unsubscribeActions();
    };
  }, [onboardingCompleted, router]);

  return null;
}

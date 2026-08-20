import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { ROUTES } from '@/navigation';
import {
  subscribeToAutoBackupReminderOpens,
  syncAutoBackupReminder,
} from '@/services/notifications';
import { useUserPreferencesStore } from '@/stores/user-preferences';

/**
 * Keeps the local Auto Backup Reminder in sync with preference + OS permission.
 * Does not request notification permission.
 */
export function AutoBackupReminderRuntime() {
  const router = useRouter();
  const onboardingCompleted = useUserPreferencesStore((state) => state.onboardingCompleted);

  useEffect(() => {
    if (!onboardingCompleted) return;

    void syncAutoBackupReminder();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncAutoBackupReminder();
      }
    });

    const unsubscribeReminderOpens = subscribeToAutoBackupReminderOpens(() => {
      router.push(ROUTES.settings);
    });

    return () => {
      appStateSubscription.remove();
      unsubscribeReminderOpens();
    };
  }, [onboardingCompleted, router]);

  return null;
}

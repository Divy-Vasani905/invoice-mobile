import { useEffect } from 'react';
import { InteractionManager } from 'react-native';

import { requestOnboardingAutoBackupReminder } from '@/services/notifications';
import { useUserPreferencesStore } from '@/stores/user-preferences';

/**
 * After first-time onboarding, asks for native notification permission
 * once the Dashboard is actually on screen.
 */
export function PostOnboardingNotificationPermission() {
  const onboardingCompleted = useUserPreferencesStore((state) => state.onboardingCompleted);
  const introShown = useUserPreferencesStore((state) => state.autoBackupReminderIntroShown);

  useEffect(() => {
    if (!onboardingCompleted || introShown) return;

    const task = InteractionManager.runAfterInteractions(() => {
      void requestOnboardingAutoBackupReminder();
    });

    return () => task.cancel();
  }, [introShown, onboardingCompleted]);

  return null;
}

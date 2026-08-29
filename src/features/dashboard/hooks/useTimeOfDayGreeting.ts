import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState } from 'react-native';

import { getTimeOfDayGreeting } from '@/features/dashboard/utils/timeOfDayGreeting';

/** Greeting from the phone clock; refreshes on focus and when the app becomes active. */
export function useTimeOfDayGreeting(): string {
  const [greeting, setGreeting] = useState(() => getTimeOfDayGreeting());

  const refreshGreeting = useCallback(() => {
    setGreeting(getTimeOfDayGreeting());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshGreeting();

      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          refreshGreeting();
        }
      });

      return () => subscription.remove();
    }, [refreshGreeting]),
  );

  return greeting;
}

import { Stack } from 'expo-router';

import { HEADERLESS_SCREEN_OPTIONS } from '@/navigation/config/screen-options';
import { useStackScreenOptions } from '@/navigation/hooks/use-screen-options';

export const unstable_settings = {
  anchor: 'index',
};

/**
 * Public flow: everything reachable before the user enters the application.
 * Both screens are full-bleed, so the group never draws a header.
 */
export default function PublicLayout() {
  const screenOptions = useStackScreenOptions(HEADERLESS_SCREEN_OPTIONS);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

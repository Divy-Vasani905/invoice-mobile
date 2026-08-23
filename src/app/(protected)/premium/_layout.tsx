import { Stack } from 'expo-router';

import { createHeaderOptions } from '@/navigation/config/screen-options';
import { useStackScreenOptions } from '@/navigation/hooks/use-screen-options';

export const unstable_settings = {
  anchor: 'index',
};

/**
 * Premium module. Sits outside the tab shell so the paywall can be presented
 * over any screen and still own the full viewport.
 */
export default function PremiumLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={createHeaderOptions({ title: 'Go Premium' })} />
      <Stack.Screen name="subscription" options={createHeaderOptions({ title: 'Subscription' })} />
      <Stack.Screen
        name="restore-purchases"
        options={createHeaderOptions({ title: 'Restore Purchases' })}
      />
    </Stack>
  );
}

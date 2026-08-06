import { Stack } from 'expo-router';

import { createHeaderOptions } from '@/navigation/config/screen-options';
import { useStackScreenOptions } from '@/navigation/hooks/use-screen-options';

export const unstable_settings = {
  anchor: 'index',
};

/**
 * Business module. Premium lives outside the tab shell so the paywall can be
 * opened from anywhere and still cover the tab bar.
 */
export default function SettingsLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={createHeaderOptions({ title: 'Settings', largeTitle: true })}
      />
      <Stack.Screen
        name="business-profile"
        options={createHeaderOptions({ title: 'Business Profile' })}
      />
      <Stack.Screen
        name="invoice-settings"
        options={createHeaderOptions({ title: 'Invoice Settings' })}
      />
      <Stack.Screen
        name="backup-restore"
        options={createHeaderOptions({ title: 'Backup & Restore' })}
      />
    </Stack>
  );
}

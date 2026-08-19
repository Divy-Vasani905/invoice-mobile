import { Stack } from 'expo-router';

import { HEADERLESS_SCREEN_OPTIONS, createHeaderOptions } from '@/navigation/config/screen-options';
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
      <Stack.Screen name="index" options={HEADERLESS_SCREEN_OPTIONS} />
      <Stack.Screen name="business-profile" options={HEADERLESS_SCREEN_OPTIONS} />
      <Stack.Screen name="business-form" options={HEADERLESS_SCREEN_OPTIONS} />
      <Stack.Screen
        name="invoice-settings"
        options={createHeaderOptions({ title: 'Invoice Settings' })}
      />
      <Stack.Screen
        name="invoice-templates"
        options={createHeaderOptions({ title: 'Invoice Templates' })}
      />
      <Stack.Screen name="invoice-number-format" options={HEADERLESS_SCREEN_OPTIONS} />
      <Stack.Screen name="currency" options={createHeaderOptions({ title: 'Currency' })} />
      <Stack.Screen name="tax-settings" options={HEADERLESS_SCREEN_OPTIONS} />
      <Stack.Screen name="tax-form" options={HEADERLESS_SCREEN_OPTIONS} />
      <Stack.Screen
        name="backup-restore"
        options={createHeaderOptions({ title: 'Backup & Restore' })}
      />
      <Stack.Screen
        name="privacy-policy"
        options={createHeaderOptions({ title: 'Privacy Policy' })}
      />
      <Stack.Screen name="terms" options={createHeaderOptions({ title: 'Terms' })} />
    </Stack>
  );
}

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
      <Stack.Screen
        name="business-profile"
        options={createHeaderOptions({ title: 'Business Profile' })}
      />
      <Stack.Screen
        name="invoice-settings"
        options={createHeaderOptions({ title: 'Invoice Settings' })}
      />
      <Stack.Screen
        name="invoice-templates"
        options={createHeaderOptions({ title: 'Invoice Templates' })}
      />
      <Stack.Screen
        name="invoice-number-format"
        options={createHeaderOptions({ title: 'Invoice Number Format' })}
      />
      <Stack.Screen name="currency" options={createHeaderOptions({ title: 'Currency' })} />
      <Stack.Screen name="tax-settings" options={createHeaderOptions({ title: 'Tax Settings' })} />
      <Stack.Screen
        name="backup-restore"
        options={createHeaderOptions({ title: 'Backup & Restore' })}
      />
      <Stack.Screen name="help-center" options={createHeaderOptions({ title: 'Help Center' })} />
      <Stack.Screen
        name="contact-support"
        options={createHeaderOptions({ title: 'Contact Support' })}
      />
      <Stack.Screen name="report-bug" options={createHeaderOptions({ title: 'Report Bug' })} />
      <Stack.Screen
        name="feature-request"
        options={createHeaderOptions({ title: 'Feature Request' })}
      />
      <Stack.Screen
        name="privacy-policy"
        options={createHeaderOptions({ title: 'Privacy Policy' })}
      />
      <Stack.Screen name="terms" options={createHeaderOptions({ title: 'Terms' })} />
    </Stack>
  );
}

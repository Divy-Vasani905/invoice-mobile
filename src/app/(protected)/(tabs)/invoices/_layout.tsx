import { Stack } from 'expo-router';

import { HEADERLESS_SCREEN_OPTIONS, createHeaderOptions } from '@/navigation/config/screen-options';
import { useStackScreenOptions } from '@/navigation/hooks/use-screen-options';

export const unstable_settings = {
  anchor: 'index',
};

/**
 * Invoices module: list to preview. Create and edit are modal routes
 * registered on the protected stack so they cover the tab bar.
 */
export default function InvoicesLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={HEADERLESS_SCREEN_OPTIONS} />
      <Stack.Screen
        name="[invoiceId]"
        options={createHeaderOptions({ title: 'Invoice Preview' })}
      />
    </Stack>
  );
}

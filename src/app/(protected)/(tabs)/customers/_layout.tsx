import { Stack } from 'expo-router';

import { HEADERLESS_SCREEN_OPTIONS, createHeaderOptions } from '@/navigation/config/screen-options';
import { useStackScreenOptions } from '@/navigation/hooks/use-screen-options';

export const unstable_settings = {
  anchor: 'index',
};

/**
 * Customers module: list to details. Create and edit are modal routes
 * registered on the protected stack.
 */
export default function CustomersLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={HEADERLESS_SCREEN_OPTIONS} />
      <Stack.Screen
        name="[customerId]"
        options={createHeaderOptions({ title: 'Customer Details' })}
      />
    </Stack>
  );
}

import { Stack } from 'expo-router';

import { HEADERLESS_SCREEN_OPTIONS } from '@/navigation/config/screen-options';
import { ROUTE_NAMES } from '@/navigation/constants/routes';
import {
  useModalScreenOptions,
  useStackScreenOptions,
} from '@/navigation/hooks/use-screen-options';

/**
 * Anchors the tab shell behind modal routes so a deep link straight into
 * `/create-invoice` still has the application rendered underneath.
 */
export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Main application stack. It hosts the tab shell, the routes that need to
 * cover the tab bar (premium), and every modal route in the app.
 */
export default function ProtectedLayout() {
  const screenOptions = useStackScreenOptions();
  const modal = useModalScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name={ROUTE_NAMES.tabs} options={HEADERLESS_SCREEN_OPTIONS} />
      <Stack.Screen name={ROUTE_NAMES.premium} options={HEADERLESS_SCREEN_OPTIONS} />

      <Stack.Screen
        name={ROUTE_NAMES.modals.createInvoice}
        options={modal.modal({ title: 'Create Invoice' })}
      />
      <Stack.Screen
        name={ROUTE_NAMES.modals.editInvoice}
        options={modal.modal({ title: 'Edit Invoice' })}
      />
      <Stack.Screen
        name={ROUTE_NAMES.modals.invoicePreview}
        options={modal.fullScreen({ title: 'Invoice Preview' })}
      />
      <Stack.Screen
        name={ROUTE_NAMES.modals.createCustomer}
        options={modal.modal({ title: 'Create Customer' })}
      />
      <Stack.Screen
        name={ROUTE_NAMES.modals.editCustomer}
        options={modal.modal({ title: 'Edit Customer' })}
      />
      <Stack.Screen
        name={ROUTE_NAMES.modals.createProduct}
        options={modal.modal({ title: 'Add Product' })}
      />
      <Stack.Screen
        name={ROUTE_NAMES.modals.editProduct}
        options={modal.modal({ title: 'Edit Product' })}
      />
    </Stack>
  );
}

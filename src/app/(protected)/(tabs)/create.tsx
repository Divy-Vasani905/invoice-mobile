import { Redirect } from 'expo-router';

import { ROUTES } from '@/navigation/constants/routes';

/**
 * Placeholder route behind the centre floating action button.
 *
 * The button itself opens the create-invoice modal without focusing this tab;
 * this redirect only covers deep links that address the tab directly.
 */
export default function CreateTabRoute() {
  return <Redirect href={ROUTES.createInvoice} />;
}

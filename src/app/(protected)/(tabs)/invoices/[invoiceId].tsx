import { Redirect, useLocalSearchParams } from 'expo-router';

import { ROUTES } from '@/navigation';

/**
 * Legacy in-tab detail path. Preview lives on the modal stack so the Invoices
 * tab always remains the list screen.
 */
export default function InvoiceDetailsRoute() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  if (invoiceId == null || invoiceId.length === 0) {
    return <Redirect href={ROUTES.invoices} />;
  }
  return <Redirect href={ROUTES.invoicePreview(invoiceId)} />;
}

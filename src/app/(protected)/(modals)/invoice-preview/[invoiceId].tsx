import { useLocalSearchParams } from 'expo-router';

import { InvoicePreviewScreen } from '@/features/invoice/screens/InvoicePreviewScreen';

export default function InvoicePreviewRoute() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  return <InvoicePreviewScreen invoiceId={invoiceId} />;
}

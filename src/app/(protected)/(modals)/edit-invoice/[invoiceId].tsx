import { useLocalSearchParams } from 'expo-router';

import { InvoiceFormScreen } from '@/features/invoice/screens/InvoiceFormScreen';

export default function EditInvoiceRoute() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  return <InvoiceFormScreen invoiceId={invoiceId} />;
}

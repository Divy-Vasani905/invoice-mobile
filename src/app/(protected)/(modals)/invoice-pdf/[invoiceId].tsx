import { useLocalSearchParams } from 'expo-router';

import { PdfPreviewScreen } from '@/features/pdf/screens/PdfPreviewScreen';

export default function InvoicePdfPreviewRoute() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  return <PdfPreviewScreen invoiceId={invoiceId} />;
}

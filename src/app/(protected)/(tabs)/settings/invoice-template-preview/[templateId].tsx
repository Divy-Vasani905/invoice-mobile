import { useLocalSearchParams } from 'expo-router';

import { InvoiceTemplatePreviewScreen } from '@/features/pdf/screens/InvoiceTemplatePreviewScreen';

export default function InvoiceTemplatePreviewRoute() {
  const { templateId } = useLocalSearchParams<{ templateId: string | string[] }>();
  return <InvoiceTemplatePreviewScreen templateId={templateId} />;
}

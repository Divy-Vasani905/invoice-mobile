import { useFocusEffect, useRouter } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showToast } from '@/components/feedback/Toast';
import { ThemedText } from '@/components/themed-text';
import { ROUTES } from '@/navigation';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { InvoiceTemplateCard } from '../components/InvoiceTemplateCard';
import { createSampleInvoicePdfModel } from '../mock/sampleInvoicePdfData';
import {
  getSelectedPdfTemplateId,
  setSelectedPdfTemplateId,
} from '../services/pdfTemplateSettings.service';
import { getInvoicePdfTemplates } from '../utils/pdfTemplateRegistry';

import type { InvoicePdfTemplateId } from '../types/pdf.types';

export const InvoiceTemplatesScreen = memo(function InvoiceTemplatesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const templates = useMemo(() => getInvoicePdfTemplates(), []);
  const sampleItemCount = useMemo(() => createSampleInvoicePdfModel().items.length, []);
  const [selectedId, setSelectedId] = useState<InvoicePdfTemplateId>(() =>
    getSelectedPdfTemplateId(),
  );

  useFocusEffect(
    useCallback(() => {
      setSelectedId(getSelectedPdfTemplateId());
    }, []),
  );

  const handleSelect = useCallback((templateId: InvoicePdfTemplateId) => {
    if (templateId === getSelectedPdfTemplateId()) return;
    const next = setSelectedPdfTemplateId(templateId);
    setSelectedId(next);
    showToast('success', { title: 'Template selected' });
  }, []);

  const handlePreview = useCallback(
    (templateId: InvoicePdfTemplateId) => {
      router.push(ROUTES.invoiceTemplatePreview(templateId));
    },
    [router],
  );

  return (
    <ScrollView
      style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{
        paddingHorizontal: cStyleValues.spacing.lg,
        paddingTop: cStyleValues.spacing.md,
        paddingBottom: insets.bottom + cStyleValues.spacing['4xl'],
        gap: cStyleValues.spacing.md,
      }}
    >
      <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>
        Choose the default layout used when generating invoice PDFs. Preview uses sample data.
      </ThemedText>

      {templates.map((template) => (
        <InvoiceTemplateCard
          key={template.id}
          template={template}
          selected={template.id === selectedId}
          sampleItemCount={sampleItemCount}
          onSelect={() => handleSelect(template.id)}
          onPreview={() => handlePreview(template.id)}
        />
      ))}
    </ScrollView>
  );
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { showToast } from '@/components/feedback/Toast';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { InvoicePdfHtmlPreview } from '../components/InvoicePdfHtmlPreview';
import { createSampleInvoicePdfModel } from '../mock/sampleInvoicePdfData';
import {
  getSelectedPdfTemplateId,
  setSelectedPdfTemplateId,
} from '../services/pdfTemplateSettings.service';
import { getInvoicePdfTemplate, parseInvoicePdfTemplateId } from '../utils/pdfTemplateRegistry';

type InvoiceTemplatePreviewScreenProps = {
  templateId: string | string[] | undefined;
};

export const InvoiceTemplatePreviewScreen = memo(function InvoiceTemplatePreviewScreen({
  templateId: templateIdParam,
}: InvoiceTemplatePreviewScreenProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const templateId = parseInvoicePdfTemplateId(templateIdParam);
  const sample = useMemo(() => createSampleInvoicePdfModel(), []);
  const template = templateId != null ? getInvoicePdfTemplate(templateId) : null;
  const html = useMemo(
    () => (template != null ? template.renderHtml(sample) : ''),
    [sample, template],
  );
  const [selectedId, setSelectedId] = useState(() => getSelectedPdfTemplateId());
  const isSelected = template != null && template.id === selectedId;

  const handleUseTemplate = useCallback(() => {
    if (template == null || isSelected) return;
    const next = setSelectedPdfTemplateId(template.id);
    setSelectedId(next);
    showToast('success', { title: 'Template selected' });
    router.back();
  }, [isSelected, router, template]);

  if (template == null) {
    return (
      <>
        <Stack.Screen options={{ title: 'Template Preview' }} />
        <EmptyState
          title="Template not found"
          description="This invoice template is not available."
          primaryAction={{ label: 'Go back', onPress: () => router.back() }}
        />
      </>
    );
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: `${template.name} Preview` }} />

      <View
        style={[
          cStyle.flex1,
          {
            paddingHorizontal: cStyleValues.spacing.lg,
            paddingTop: cStyleValues.spacing.md,
            paddingBottom: insets.bottom + cStyleValues.spacing.lg,
            gap: cStyleValues.spacing.md,
          },
        ]}
      >
        <ThemedText
          style={[
            theme.typography.bodyMedium,
            { color: theme.colors.textSecondary, flexShrink: 0 },
          ]}
        >
          Preview using sample invoice data
        </ThemedText>

        <View style={[cStyle.flex1, { minHeight: 0 }]}>
          <InvoicePdfHtmlPreview
            html={html}
            accessibilityLabel={`${template.name} invoice template preview`}
          />
        </View>

        <View style={{ flexShrink: 0 }}>
          <Button
            label={isSelected ? 'Currently Selected' : 'Use Template'}
            variant={isSelected ? 'secondary' : 'primary'}
            disabled={isSelected}
            onPress={handleUseTemplate}
            leftIcon={({ color, size }) => (
              <Ionicons
                name={isSelected ? 'checkmark-circle' : 'color-palette-outline'}
                color={color}
                size={size}
              />
            )}
            accessibilityLabel={
              isSelected
                ? `${template.name} is currently selected`
                : `Use ${template.name} invoice template`
            }
          />
        </View>
      </View>
    </View>
  );
});

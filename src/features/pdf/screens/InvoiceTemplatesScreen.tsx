import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { showToast } from '@/components/feedback/Toast';
import { Card } from '@/components/layout/Card';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

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
  const templates = useMemo(() => getInvoicePdfTemplates(), []);
  const sample = useMemo(() => createSampleInvoicePdfModel(), []);
  const [selectedId, setSelectedId] = useState<InvoicePdfTemplateId>(() =>
    getSelectedPdfTemplateId(),
  );

  const handleSelect = useCallback((templateId: InvoicePdfTemplateId) => {
    const next = setSelectedPdfTemplateId(templateId);
    setSelectedId(next);
    showToast('success', { title: 'Template selected' });
  }, []);

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

      {templates.map((template) => {
        const selected = template.id === selectedId;
        return (
          <Card
            key={template.id}
            variant={selected ? 'filled' : 'outlined'}
            padding="lg"
            pressable
            onPress={() => handleSelect(template.id)}
            accessibilityLabel={`${template.name} template`}
            accessibilityHint={template.description}
          >
            <View style={[cStyle.g12]}>
              <View style={[cStyle.flexRow, cStyle.justifyBetween, cStyle.itemCenter]}>
                <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8]}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: template.accentColor,
                    }}
                  />
                  <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
                    {template.name}
                  </ThemedText>
                </View>
                {selected ? <Badge label="Selected" variant="success" size="sm" /> : null}
              </View>

              <ThemedText
                style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}
              >
                {template.description}
              </ThemedText>

              <Pressable
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${template.name} preview sample`}
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.cards.layout.radius,
                  padding: cStyleValues.spacing.md,
                  backgroundColor: theme.colors.surface,
                  gap: cStyleValues.spacing.sm,
                }}
              >
                <View style={[cStyle.flexRow, cStyle.justifyBetween]}>
                  <ThemedText style={[theme.typography.label, { color: template.accentColor }]}>
                    {sample.business.name}
                  </ThemedText>
                  <ThemedText
                    style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                  >
                    {sample.invoiceNumber}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                >
                  Bill to {sample.customer.name}
                </ThemedText>
                <ThemedText
                  style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
                >
                  {sample.totals.grandTotalLabel}
                </ThemedText>
                <ThemedText
                  style={[theme.typography.caption, { color: theme.colors.textTertiary }]}
                >
                  {sample.items.length} sample items · {template.id} layout
                </ThemedText>
              </Pressable>

              <Button
                label={selected ? 'Selected' : 'Use Template'}
                variant={selected ? 'secondary' : 'primary'}
                size="sm"
                disabled={selected}
                onPress={() => handleSelect(template.id)}
                leftIcon={({ color, size }) => (
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'color-palette-outline'}
                    color={color}
                    size={size}
                  />
                )}
                accessibilityLabel={
                  selected ? `${template.name} selected` : `Select ${template.name} template`
                }
              />
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/layout/Card';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';

import { TemplateThumbnail } from './TemplateThumbnail';

import type { InvoicePdfTemplateMeta } from '../types/pdf.types';

type InvoiceTemplateCardProps = {
  template: InvoicePdfTemplateMeta;
  selected: boolean;
  sampleItemCount: number;
  onSelect: () => void;
  onPreview: () => void;
};

export const InvoiceTemplateCard = memo(function InvoiceTemplateCard({
  template,
  selected,
  sampleItemCount,
  onSelect,
  onPreview,
}: InvoiceTemplateCardProps) {
  const { theme, isDark } = useTheme();
  const selectedBorderColor = isDark ? theme.colors.borderFocus : template.accentColor;

  return (
    <Card
      variant="outlined"
      padding="lg"
      style={{
        borderWidth: 2,
        borderColor: selected ? selectedBorderColor : theme.colors.border,
        backgroundColor: selected ? theme.colors.backgroundSubtle : undefined,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${template.name} invoice template`}
        accessibilityHint="Selects this layout for generated invoice PDFs"
        accessibilityState={{ selected }}
        onPress={onSelect}
        style={[cStyle.g12]}
      >
        <View style={[cStyle.flexRow, cStyle.justifyBetween, cStyle.itemCenter]}>
          <View
            style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8, { flex: 1, paddingRight: 8 }]}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: template.accentColor,
              }}
            />
            <ThemedText
              style={[theme.typography.title, { color: theme.colors.textPrimary, flexShrink: 1 }]}
            >
              {template.name}
            </ThemedText>
          </View>
          {selected && (
            <Badge
              label="Selected"
              variant="success"
              size="sm"
              icon={({ color, size }) => <Ionicons name="checkmark" color={color} size={size} />}
            />
          )}
        </View>

        <ThemedText style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
          {template.description}
        </ThemedText>

        <TemplateThumbnail templateId={template.id} accentColor={template.accentColor} />

        <View
          pointerEvents="box-none"
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <ThemedText style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            {sampleItemCount} sample items
          </ThemedText>
          <Button
            label="Preview"
            variant="outline"
            size="md"
            onPress={onPreview}
            leftIcon={({ color, size }) => (
              <Ionicons name="eye-outline" color={color} size={size} />
            )}
            accessibilityLabel={`Preview ${template.name} invoice template`}
          />
        </View>
      </Pressable>
    </Card>
  );
});

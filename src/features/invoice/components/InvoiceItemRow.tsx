import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import {
  formatMoney,
  getProductUnitLabel,
  parsePriceInput,
  parseQuantityInput,
  toMinorUnits,
} from '../utils/invoice.utils';

import type { InvoiceFormItemValues } from '../types/invoice.types';

export interface InvoiceItemRowProps {
  item: InvoiceFormItemValues;
  currencyCode: string;
  lineTotalMinor?: number;
  onEdit: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

export const InvoiceItemRow = memo(function InvoiceItemRow({
  item,
  currencyCode,
  lineTotalMinor,
  onEdit,
  onRemove,
}: InvoiceItemRowProps) {
  const { theme } = useTheme();
  const title = item.name.trim() || item.description.trim() || 'Untitled item';
  const quantity = parseQuantityInput(item.quantity) ?? 0;
  const unitPriceMajor = parsePriceInput(item.unitPrice) ?? 0;
  const computedTotal = lineTotalMinor ?? toMinorUnits(unitPriceMajor, currencyCode) * quantity;

  return (
    <View
      style={[
        cStyle.g8,
        {
          padding: cStyleValues.spacing.md,
          borderRadius: theme.cards.layout.radius,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <View style={[cStyle.flexRow, cStyle.justifyBetween, cStyle.itemStart]}>
        <View style={[cStyle.flex1, cStyle.g4, { paddingRight: cStyleValues.spacing.md }]}>
          <ThemedText
            style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
            numberOfLines={2}
          >
            {title}
          </ThemedText>
          <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            {quantity} {getProductUnitLabel(item.unit)} ×{' '}
            {formatMoney(toMinorUnits(unitPriceMajor, currencyCode), currencyCode)}
          </ThemedText>
          {item.taxRate.trim().length > 0 ? (
            <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Tax {item.taxRate}%
              {item.discount.trim().length > 0 ? ` · Discount ${item.discount}` : ''}
            </ThemedText>
          ) : item.discount.trim().length > 0 ? (
            <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Discount {item.discount}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText
          style={[
            theme.typography.bodyMedium,
            cStyle.fontBold,
            { color: theme.colors.textPrimary },
          ]}
        >
          {formatMoney(computedTotal, currencyCode)}
        </ThemedText>
      </View>
      <View style={[cStyle.flexRow, cStyle.g12]}>
        <Pressable
          onPress={() => onEdit(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Edit item ${title}`}
          style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g4]}
        >
          <Ionicons name="create-outline" size={theme.iconSizes.sm} color={theme.colors.primary} />
          <ThemedText style={[theme.typography.label, { color: theme.colors.primary }]}>
            Edit
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onRemove(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Remove item ${title}`}
          style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g4]}
        >
          <Ionicons name="trash-outline" size={theme.iconSizes.sm} color={theme.colors.danger} />
          <ThemedText style={[theme.typography.label, { color: theme.colors.danger }]}>
            Remove
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
});

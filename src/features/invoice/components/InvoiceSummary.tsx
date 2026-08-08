import { memo } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { formatMoney } from '../utils/invoice.utils';

export interface InvoiceSummaryProps {
  currencyCode: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  roundOffMinor: number;
  grandTotalMinor: number;
}

export const InvoiceSummary = memo(function InvoiceSummary({
  currencyCode,
  subtotalMinor,
  discountMinor,
  taxMinor,
  roundOffMinor,
  grandTotalMinor,
}: InvoiceSummaryProps) {
  const { theme } = useTheme();

  const rows: { label: string; value: string; emphasize?: boolean }[] = [
    { label: 'Subtotal', value: formatMoney(subtotalMinor, currencyCode) },
    { label: 'Discount', value: formatMoney(discountMinor, currencyCode) },
    { label: 'Tax', value: formatMoney(taxMinor, currencyCode) },
    { label: 'Round Off', value: formatMoney(roundOffMinor, currencyCode) },
    {
      label: 'Grand Total',
      value: formatMoney(grandTotalMinor, currencyCode),
      emphasize: true,
    },
  ];

  return (
    <View
      accessible
      accessibilityLabel="Invoice totals summary"
      style={[
        cStyle.g8,
        {
          padding: cStyleValues.spacing.lg,
          borderRadius: theme.cards.layout.radius,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      {rows.map((row) => (
        <View key={row.label} style={[cStyle.flexRow, cStyle.justifyBetween, cStyle.itemCenter]}>
          <ThemedText
            style={[
              row.emphasize ? theme.typography.bodyMedium : theme.typography.bodySmall,
              {
                color: row.emphasize ? theme.colors.textPrimary : theme.colors.textSecondary,
                fontWeight: row.emphasize ? theme.typography.headingL.fontWeight : undefined,
              },
            ]}
          >
            {row.label}
          </ThemedText>
          <ThemedText
            style={[
              row.emphasize ? theme.typography.bodyMedium : theme.typography.bodySmall,
              {
                color: theme.colors.textPrimary,
                fontWeight: row.emphasize ? theme.typography.headingL.fontWeight : undefined,
              },
            ]}
          >
            {row.value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
});

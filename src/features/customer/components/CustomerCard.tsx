import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/layout/Card';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';

import { getInitials } from '../utils/customer.utils';

import type { CustomerSummary } from '../types/customer.types';

export interface CustomerCardProps {
  summary: CustomerSummary;
  onPress: (customerId: string) => void;
  loading?: boolean;
  status?: 'active' | 'inactive';
}

export const CustomerCard = memo(function CustomerCard({
  summary,
  onPress,
  loading = false,
}: CustomerCardProps) {
  const { theme } = useTheme();
  const { customer, invoiceCount, totalInvoiceAmountMinor, currencyCode } = summary;
  const amount = useMemo(() => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    });
    const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(totalInvoiceAmountMinor / 10 ** fractionDigits);
  }, [currencyCode, totalInvoiceAmountMinor]);

  return (
    <Card
      variant="outlined"
      pressable
      loading={loading}
      onPress={() => onPress(customer.id)}
      accessibilityLabel={`${customer.displayName}, ${invoiceCount} ${
        invoiceCount === 1 ? 'invoice' : 'invoices'
      }, total ${amount}`}
      accessibilityHint="Opens the edit customer form"
      padding="lg"
    >
      <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g12]}>
        <Avatar
          initials={getInitials(customer.displayName)}
          size="lg"
          accessibilityLabel={`${customer.displayName} avatar`}
        />
        <View style={[cStyle.flex1, cStyle.g4]} importantForAccessibility="no-hide-descendants">
          <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
            {customer.displayName}
          </ThemedText>
          {customer.companyName != null && (
            <ThemedText style={[theme.typography.helper, { color: theme.colors.textSecondary }]}>
              {customer.companyName}
            </ThemedText>
          )}
          <ThemedText style={[theme.typography.helper, { color: theme.colors.textTertiary }]}>
            {invoiceCount} {invoiceCount === 1 ? 'invoice' : 'invoices'} · {amount}
          </ThemedText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={theme.iconSizes.md}
          color={theme.colors.textTertiary}
          importantForAccessibility="no"
        />
      </View>
    </Card>
  );
});

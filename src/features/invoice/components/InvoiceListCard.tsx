import { memo, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/layout/Card';
import { ListItem } from '@/components/layout/ListItem';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';

import type { InvoiceListItem } from '../types/invoice.types';

export interface InvoiceListCardProps {
  item: InvoiceListItem;
  onPress?: (invoiceId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const InvoiceListCard = memo(function InvoiceListCard({
  item,
  onPress,
  style,
}: InvoiceListCardProps) {
  const { theme } = useTheme();
  const handlePress = useMemo(
    () => (onPress == null ? undefined : () => onPress(item.invoice.id)),
    [item.invoice.id, onPress],
  );

  const trailing = useMemo(
    () => (
      <View style={[cStyle.itemEnd, cStyle.g4]}>
        <ThemedText
          style={[
            theme.typography.bodyMedium,
            cStyle.fontBold,
            { color: theme.colors.textPrimary },
          ]}
        >
          {item.formattedAmount}
        </ThemedText>
        <Badge label={item.displayStatus.toUpperCase()} variant={item.badgeVariant} size="sm" />
      </View>
    ),
    [
      item.badgeVariant,
      item.displayStatus,
      item.formattedAmount,
      theme.colors.textPrimary,
      theme.typography.bodyMedium,
    ],
  );

  return (
    <Card
      variant="outlined"
      pressable={handlePress != null}
      onPress={handlePress}
      padding="none"
      style={[cStyle.mb8, style]}
      accessibilityLabel={`Invoice ${item.invoice.invoiceNumber}, ${item.customerName}, ${item.formattedAmount}, ${item.displayStatus}`}
      accessibilityHint="Opens invoice preview"
    >
      <ListItem
        title={item.invoice.invoiceNumber}
        subtitle={`${item.customerName}\n${item.formattedDate}`}
        trailing={trailing}
        pressable={handlePress != null}
        onPress={handlePress}
      />
    </Card>
  );
});

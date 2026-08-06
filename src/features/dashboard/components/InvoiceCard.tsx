import { memo, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/layout/Card';
import { ListItem } from '@/components/layout/ListItem';
import { ThemedText } from '@/components/themed-text';
import { useTheme, cStyle, type BadgeVariant } from '@/theme';

export interface InvoiceCardProps {
  /** Invoice identifier number (e.g. "INV-0025") */
  invoiceNumber: string;
  /** Customer or business name */
  customerName: string;
  /** Invoice amount (numeric) */
  amount: number;
  /** Invoice status value */
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  /** Formatted date of the invoice */
  date: string;
  /** Callback when card is pressed */
  onPress?: () => void;
  /** Styling overrides for the outer container card */
  style?: StyleProp<ViewStyle>;
}

export const InvoiceCard = memo(function InvoiceCard({
  invoiceNumber,
  customerName,
  amount,
  status,
  date,
  onPress,
  style,
}: InvoiceCardProps) {
  const { theme } = useTheme();

  // Map status to semantic Badge variant
  const badgeVariant = useMemo<BadgeVariant>(() => {
    switch (status) {
      case 'Paid':
        return 'paid';
      case 'Pending':
        return 'pending';
      case 'Overdue':
        return 'overdue';
      case 'Draft':
        return 'draft';
      default:
        return 'neutral';
    }
  }, [status]);

  // Format currency value cleanly
  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, [amount]);

  // Trailing stack component displaying Amount and Status Badge
  const trailingContent = useMemo(() => {
    return (
      <View style={[cStyle.itemEnd, cStyle.g4]}>
        <ThemedText
          style={[
            theme.typography.bodyMedium,
            cStyle.fontBold,
            { color: theme.colors.textPrimary },
          ]}
        >
          {formattedAmount}
        </ThemedText>
        <Badge label={status} variant={badgeVariant} size="sm" />
      </View>
    );
  }, [
    formattedAmount,
    status,
    badgeVariant,
    theme.colors.textPrimary,
    theme.typography.bodyMedium,
  ]);

  return (
    <Card
      variant="outlined"
      pressable={onPress != null}
      onPress={onPress}
      padding="none"
      style={[cStyle.mb8, style]}
    >
      <ListItem
        title={customerName}
        subtitle={`${invoiceNumber} • ${date}`}
        trailing={trailingContent}
        pressable={onPress != null}
        onPress={onPress}
      />
    </Card>
  );
});

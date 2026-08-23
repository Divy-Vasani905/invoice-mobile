import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useMemo } from 'react';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CREDIT_LOW_THRESHOLD } from '@/features/credits/constants';
import { cStyle, useTheme } from '@/theme';

export type InvoiceCreditIndicatorProps = {
  remaining: number;
  isPremium?: boolean;
  onPress: () => void;
};

/**
 * Compact dashboard header chip showing total available invoice credits (or PRO).
 */
export const InvoiceCreditIndicator = memo(function InvoiceCreditIndicator({
  remaining,
  isPremium = false,
  onPress,
}: InvoiceCreditIndicatorProps) {
  const { theme } = useTheme();
  const variantToken = theme.badges.variants['pending'];

  const tone = useMemo(() => {
    if (isPremium) {
      return {
        color: theme.colors.premium,
        backgroundColor: theme.colors.premiumSubtle,
        label: 'PRO',
      };
    }
    if (remaining <= 0) {
      return {
        color: theme.colors.danger,
        backgroundColor: theme.colors.dangerSubtle,
        label: '0',
      };
    }
    if (remaining === 1) {
      return {
        color: theme.colors.warning,
        backgroundColor: theme.colors.warningSubtle,
        label: '1',
      };
    }
    if (remaining <= CREDIT_LOW_THRESHOLD) {
      return {
        color: theme.colors.warning,
        backgroundColor: theme.colors.warningSubtle,
        label: String(remaining),
      };
    }
    return {
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.primarySubtle,
      label: String(remaining),
    };
  }, [isPremium, remaining, theme.colors]);

  const accessibilityLabel = isPremium
    ? 'Premium unlimited invoices'
    : `${remaining} invoice credits available`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens invoice usage details"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        cStyle.flexRow,
        cStyle.itemCenter,
        cStyle.g4,
        cStyle.ph12,
        cStyle.pv8,
        cStyle.r12,
        {
          minHeight: 36,
          backgroundColor: theme.colors[variantToken.background],
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      {isPremium ? (
        <ThemedText
          style={[theme.typography.label, cStyle.fontBold, { color: tone.color, fontSize: 12 }]}
        >
          PRO
        </ThemedText>
      ) : (
        <>
          <Ionicons name="diamond" size={theme.iconSizes.md} color={theme.colors.chartExpense} />
          <ThemedText
            style={[
              theme.typography.label,
              cStyle.fontBold,
              {
                color: tone.color,
                fontSize: 13,
                minWidth: 12,
                textAlign: 'center',
              },
            ]}
          >
            {tone.label}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
});

import { memo } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/layout/Card';
import { ThemedText } from '@/components/themed-text';
import { useTheme, cStyle } from '@/theme';

import type { SummaryCardProps } from './types';

/**
 * Reusable SummaryCard component for displaying key financial KPIs.
 * Wraps the base layout Card for consistency.
 */
export const SummaryCard = memo(function SummaryCard({
  title,
  value,
  subtitle,
  badge,
  variant = 'elevated',
  onPress,
  style,
  loading = false,
}: SummaryCardProps) {
  const { theme } = useTheme();

  return (
    <Card
      variant={variant}
      pressable={onPress != null}
      onPress={onPress}
      loading={loading}
      style={style}
    >
      <View style={[cStyle.g8]}>
        {/* Header row: Title and Badge */}
        <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.justifyBetween]}>
          <ThemedText style={[theme.typography.label, { color: theme.colors.textSecondary }]}>
            {title}
          </ThemedText>
          {badge}
        </View>

        {/* Value: Large metric display */}
        <ThemedText
          style={[
            theme.typography.headingM,
            cStyle.fontBold,
            { color: theme.colors.textPrimary, fontSize: 28, lineHeight: 34 },
          ]}
        >
          {value}
        </ThemedText>

        {/* Optional Subtitle */}
        {subtitle != null && (
          <ThemedText style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </Card>
  );
});

import { memo } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { getBadgeStyles } from './styles';

import type { BadgeProps } from './types';

/**
 * Compact label for semantic categories, counts, and state indicators.
 */
export const Badge = memo(function Badge({
  label,
  variant = 'neutral',
  size = 'sm',
  icon,
  accessibilityLabel,
  style,
  labelStyle,
  ...viewProps
}: BadgeProps) {
  const { theme } = useTheme();
  const styles = getBadgeStyles(theme, variant, size);

  return (
    <View
      {...viewProps}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.container, style]}
    >
      {icon?.({ color: styles.iconColor, size: styles.iconSize })}
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </View>
  );
});

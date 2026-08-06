import { memo } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useTheme } from '@/theme';

import type { FloatingActionButtonProps } from './types';

export const FloatingActionButton = memo(function FloatingActionButton({
  icon,
  label,
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  accessibilityLabel,
}: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const token = theme.buttons.sizes[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled || loading}
      onPress={onPress}
      style={{
        minHeight: token.minHeight,
        minWidth: label == null ? token.minHeight : undefined,
        paddingHorizontal: token.paddingHorizontal,
        borderRadius: label == null ? token.minHeight / 2 : token.radius,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: token.gap,
        backgroundColor: disabled ? theme.colors.interactiveDisabled : theme.colors.primary,
        ...theme.elevation.lg,
      }}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onPrimary} />
      ) : (
        icon({ color: theme.colors.onPrimary, size: theme.iconSizes[token.iconSize] })
      )}
      {label != null && (
        <Text style={[theme.typography[token.typography], { color: theme.colors.onPrimary }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
});

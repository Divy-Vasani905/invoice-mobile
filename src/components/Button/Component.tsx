import { memo } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useTheme } from '@/theme';

import { getButtonStyles } from './styles';

import type { ButtonProps } from './types';

/**
 * Accessible, theme-aware action control with tokenized size and variant
 * styling. Icons are render props so their color and size always match state.
 */
export const Button = memo(function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
  accessibilityLabel,
  ...pressableProps
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;
  const resolvedVariant = isDisabled ? 'disabled' : variant;

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        getButtonStyles(theme, resolvedVariant, size, pressed).container,
        style,
      ]}
    >
      {({ pressed }) => {
        const styles = getButtonStyles(theme, resolvedVariant, size, pressed);

        return (
          <>
            {loading ? (
              <ActivityIndicator color={styles.iconColor} size={styles.iconSize} />
            ) : (
              leftIcon?.({ color: styles.iconColor, size: styles.iconSize })
            )}
            <Text style={[styles.label, labelStyle]}>{label}</Text>
            {!loading && rightIcon?.({ color: styles.iconColor, size: styles.iconSize })}
          </>
        );
      }}
    </Pressable>
  );
});

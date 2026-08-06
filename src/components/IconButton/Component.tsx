import { memo } from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme';

import { getIconButtonStyles } from './styles';

import type { IconButtonProps } from './types';

/**
 * Compact accessible button for a single themed icon action.
 */
export const IconButton = memo(function IconButton({
  icon,
  accessibilityLabel,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  style,
  ...pressableProps
}: IconButtonProps) {
  const { theme } = useTheme();
  const resolvedVariant = disabled ? 'disabled' : variant;

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={theme.buttons.sizes.sm.paddingHorizontal}
      style={({ pressed }) => [
        getIconButtonStyles(theme, resolvedVariant, size, pressed).container,
        style,
      ]}
    >
      {({ pressed }) => {
        const styles = getIconButtonStyles(theme, resolvedVariant, size, pressed);
        return icon({ color: styles.iconColor, size: styles.iconSize });
      }}
    </Pressable>
  );
});

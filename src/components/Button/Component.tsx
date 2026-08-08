import { memo, useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type GestureResponderEvent,
} from 'react-native';

import { useTheme } from '@/theme';

import { getButtonStyles } from './styles';

import type { ButtonProps } from './types';

export const Button = memo(function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading: externalLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
  accessibilityLabel,
  onPress,
  ...pressableProps
}: ButtonProps) {
  const { theme } = useTheme();

  const [internalLoading, setInternalLoading] = useState(false);

  // Important: ref prevents multiple taps before React re-renders.
  const pressLockedRef = useRef(false);

  const loading = externalLoading || internalLoading;
  const isDisabled = disabled || loading;
  const resolvedVariant = isDisabled ? 'disabled' : variant;

  const handlePress = useCallback(
    async (event: GestureResponderEvent) => {
      // Prevent rapid multiple taps.
      if (pressLockedRef.current || disabled || externalLoading) {
        return;
      }

      // Lock immediately.
      pressLockedRef.current = true;
      setInternalLoading(true);

      try {
        await onPress?.(event);
      } finally {
        pressLockedRef.current = false;
        setInternalLoading(false);
      }
    },
    [onPress, disabled, externalLoading],
  );

  return (
    <Pressable
      {...pressableProps}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      style={({ pressed }) => [
        getButtonStyles(theme, resolvedVariant, size, pressed).container,
        style,
      ]}
    >
      {({ pressed }) => {
        const styles = getButtonStyles(
          theme,
          resolvedVariant,
          size,
          pressed,
        );

        return (
          <>
            {loading ? (
              <ActivityIndicator
                color={styles.iconColor}
                size={styles.iconSize}
              />
            ) : (
              leftIcon?.({
                color: styles.iconColor,
                size: styles.iconSize,
              })
            )}

            <Text style={[styles.label, labelStyle]}>
              {label}
            </Text>

            {!loading &&
              rightIcon?.({
                color: styles.iconColor,
                size: styles.iconSize,
              })}
          </>
        );
      }}
    </Pressable>
  );
});
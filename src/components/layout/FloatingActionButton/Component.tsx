import { memo, useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type GestureResponderEvent,
} from 'react-native';

import { useTheme } from '@/theme';

import type { FloatingActionButtonProps } from './types';

export const FloatingActionButton = memo(function FloatingActionButton({
  icon,
  label,
  size = 'md',
  disabled = false,
  loading: externalLoading = false,
  onPress,
  accessibilityLabel,
}: FloatingActionButtonProps) {
  const { theme } = useTheme();

  const [internalLoading, setInternalLoading] = useState(false);

  // Prevent multiple rapid taps before React re-renders.
  const pressLockedRef = useRef(false);

  const loading = externalLoading || internalLoading;
  const isDisabled = disabled || loading;

  const token = theme.buttons.sizes[size];

  const handlePress = useCallback(async () => {
    if (pressLockedRef.current || disabled || externalLoading) {
      return;
    }
  
    pressLockedRef.current = true;
    setInternalLoading(true);
  
    try {
      await onPress?.();
    } finally {
      pressLockedRef.current = false;
      setInternalLoading(false);
    }
  }, [onPress, disabled, externalLoading]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      onPress={handlePress}
      style={{
        minHeight: token.minHeight,
        minWidth: label == null ? token.minHeight : undefined,
        paddingHorizontal: token.paddingHorizontal,
        borderRadius:
          label == null ? token.minHeight / 2 : token.radius,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: token.gap,
        backgroundColor: isDisabled
          ? theme.colors.interactiveDisabled
          : theme.colors.primary,
        ...theme.elevation.lg,
      }}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onPrimary} />
      ) : (
        icon({
          color: theme.colors.onPrimary,
          size: theme.iconSizes[token.iconSize],
        })
      )}

      {label != null && (
        <Text
          style={[
            theme.typography[token.typography],
            { color: theme.colors.onPrimary },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
});
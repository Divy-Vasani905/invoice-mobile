import { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import type { SwitchProps } from './types';

export const Switch = memo(function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: SwitchProps) {
  const { theme } = useTheme();

  const TRACK_WIDTH = 52;
  const TRACK_HEIGHT = 30;
  const THUMB_SIZE = 22;

  const translateX = useRef(new Animated.Value(value ? TRACK_WIDTH - TRACK_HEIGHT : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? TRACK_WIDTH - TRACK_HEIGHT : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();
  }, [value, translateX]);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.inputs.layout.gap,
          opacity: disabled ? cStyleValues.opacity.medium : cStyleValues.opacity.opaque,
        },
        style,
      ]}
    >
      {(label != null || description != null) && (
        <View style={{ flex: 1, gap: theme.inputs.layout.gap }}>
          {label != null && (
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
              {label}
            </Text>
          )}

          {description != null && (
            <Text style={[theme.typography.helper, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
      )}

      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          checked: value,
          disabled,
        }}
        disabled={disabled}
        onPress={() => onValueChange?.(!value)}
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: value ? theme.colors.primary : '#9CA3AF',
          justifyContent: 'center',
          paddingHorizontal: (TRACK_HEIGHT - THUMB_SIZE) / 2,
        }}
      >
        <Animated.View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: value ? theme.colors.onPrimary : '#F3F4F6',
            transform: [{ translateX }],
          }}
        />
      </Pressable>
    </View>
  );
});

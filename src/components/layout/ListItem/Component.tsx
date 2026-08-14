import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Divider } from '@/components/Divider';
import { useTheme } from '@/theme';

import type { ListItemProps } from './types';

export const ListItem = memo(function ListItem({
  title,
  subtitle,
  description,
  leading,
  trailing,
  badge,
  status,
  divider = false,
  pressable = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ListItemProps) {
  const { theme } = useTheme();

  const [internalLoading, setInternalLoading] = useState(false);

  // Synchronous lock to prevent rapid multiple taps.
  const pressLockedRef = useRef(false);

  const isDisabled = disabled || internalLoading;

  const handlePress = useCallback(async () => {
    if (pressLockedRef.current || disabled || !onPress) {
      return;
    }

    // Lock immediately.
    pressLockedRef.current = true;
    setInternalLoading(true);

    try {
      await onPress();
    } finally {
      pressLockedRef.current = false;
      setInternalLoading(false);
    }
  }, [onPress, disabled]);

  const body = (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.cards.layout.gap,
          padding: theme.cards.layout.padding,
          minHeight: theme.buttons.sizes.md.minHeight,
        }}
      >
        {leading}

        <View
          style={{
            flex: 1,
            gap: theme.inputs.layout.gap,
          }}
        >
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>

          {subtitle != null && (
            <Text style={[theme.typography.helper, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}

          {description != null && (
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textTertiary }]}>
              {description}
            </Text>
          )}
        </View>

        {badge}
        {status}

        {trailing ??
          (pressable && (
            <Ionicons
              name="chevron-forward"
              color={theme.colors.textTertiary}
              size={theme.iconSizes.md}
              importantForAccessibility="no"
            />
          ))}
      </View>

      {divider && <Divider />}
    </>
  );

  return pressable ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: internalLoading,
      }}
      disabled={isDisabled}
      onPress={handlePress}
      style={style}
    >
      {body}
    </Pressable>
  ) : (
    <View
      accessible={accessibilityLabel != null}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={style}
    >
      {body}
    </View>
  );
});

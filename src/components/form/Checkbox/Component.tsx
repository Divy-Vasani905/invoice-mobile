import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import type { CheckboxProps } from './types';

/**
 * Controlled checkbox with optional label, description, and externally
 * supplied error text. It does not perform validation.
 */
export const Checkbox = memo(function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  errorMessage,
  disabled = false,
  style,
}: CheckboxProps) {
  const { theme } = useTheme();
  const isError = errorMessage != null;
  const size = theme.iconSizes.md;
  const borderColor = isError
    ? theme.colors.danger
    : checked
      ? theme.colors.primary
      : theme.colors.borderStrong;

  return (
    <View style={[{ gap: theme.inputs.layout.gap }, style]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked, disabled }}
        disabled={disabled}
        onPress={() => onCheckedChange?.(!checked)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.inputs.layout.gap,
          opacity: disabled ? cStyleValues.opacity.medium : cStyleValues.opacity.opaque,
        }}
      >
        <View
          style={{
            width: size,
            height: size,
            borderRadius: cStyleValues.radius.xs,
            borderWidth: theme.cards.layout.borderWidth,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: checked ? theme.colors.primary : theme.colors.surface,
            borderColor,
          }}
        >
          {checked && <Ionicons name="checkmark" color={theme.colors.onPrimary} size={size} />}
        </View>
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
      </Pressable>
      {errorMessage != null && (
        <Text
          accessibilityRole="alert"
          style={[theme.typography.error, { color: theme.colors.danger }]}
        >
          {errorMessage}
        </Text>
      )}
    </View>
  );
});

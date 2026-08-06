import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import type { RadioGroupProps, RadioItemProps } from './types';

/**
 * One controlled radio option, usable independently or through `RadioGroup`.
 */
export const RadioItem = memo(function RadioItem({
  value,
  label,
  description,
  disabled = false,
  checked,
  onPress,
  style,
}: RadioItemProps) {
  const { theme } = useTheme();
  const size = theme.iconSizes.md;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onPress?.(value)}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.inputs.layout.gap,
          opacity: disabled ? cStyleValues.opacity.medium : cStyleValues.opacity.opaque,
        },
        style,
      ]}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: theme.cards.layout.borderWidth,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: checked ? theme.colors.primary : theme.colors.borderStrong,
        }}
      >
        {checked && (
          <View
            style={{
              width: theme.iconSizes.xs,
              height: theme.iconSizes.xs,
              borderRadius: theme.iconSizes.xs / 2,
              backgroundColor: theme.colors.primary,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, gap: theme.inputs.layout.gap }}>
        <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{label}</Text>
        {description != null && (
          <Text style={[theme.typography.helper, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
    </Pressable>
  );
});

/**
 * Controlled, token-spaced single-selection radio group.
 */
export const RadioGroup = memo(function RadioGroup({
  options,
  value,
  onValueChange,
  disabled = false,
  style,
}: RadioGroupProps) {
  const { theme } = useTheme();

  return (
    <View accessibilityRole="radiogroup" style={[{ gap: theme.inputs.layout.gap }, style]}>
      {options.map((option) => (
        <RadioItem
          key={option.value}
          {...option}
          checked={option.value === value}
          disabled={disabled || option.disabled}
          onPress={onValueChange}
        />
      ))}
    </View>
  );
});

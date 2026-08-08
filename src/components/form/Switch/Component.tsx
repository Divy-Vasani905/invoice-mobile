import { memo } from 'react';
import { Switch as NativeSwitch, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import type { SwitchProps } from './types';

/**
 * Controlled native switch with optional semantic label and description.
 */
export const Switch = memo(function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  accessibilityLabel,
  style,
}: SwitchProps) {
  const { theme } = useTheme();

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
      <NativeSwitch
        accessibilityLabel={accessibilityLabel ?? label}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.backgroundSubtle, true: theme.colors.primary }}
        thumbColor={value ? theme.colors.onPrimary : theme.colors.surfaceRaised}
        value={value}
      />
    </View>
  );
});

import { memo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import type { SegmentControlProps } from './types';

export const SegmentControl = memo(function SegmentControl({
  options,
  value,
  onValueChange,
  scrollable = false,
  equalWidth = false,
}: SegmentControlProps) {
  const { theme } = useTheme();
  const body = (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        gap: theme.inputs.layout.gap,
        padding: theme.inputs.layout.gap,
        backgroundColor: theme.colors.backgroundSubtle,
        borderRadius: theme.cards.layout.radius,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        const color = active ? theme.colors.onPrimary : theme.colors.textSecondary;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: o.disabled }}
            disabled={o.disabled}
            onPress={() => onValueChange?.(o.value)}
            style={{
              flex: equalWidth ? 1 : undefined,
              minHeight: theme.buttons.sizes.sm.minHeight,
              paddingHorizontal: theme.buttons.sizes.sm.paddingHorizontal,
              borderRadius: theme.buttons.sizes.sm.radius,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.inputs.layout.gap,
              backgroundColor: active ? theme.colors.primary : 'transparent',
            }}
          >
            {o.icon?.({ color, size: theme.iconSizes.sm })}
            <Text style={[theme.typography.label, { color }]}>
              {o.label}
              {o.badgeCount != null ? ` (${o.badgeCount})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
  return scrollable ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {body}
    </ScrollView>
  ) : (
    body
  );
});

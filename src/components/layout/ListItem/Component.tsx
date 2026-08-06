import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
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
  style,
}: ListItemProps) {
  const { theme } = useTheme();
  const body = (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.cards.layout.gap,
          padding: theme.cards.layout.padding,
        }}
      >
        {leading}
        <View style={{ flex: 1, gap: theme.inputs.layout.gap }}>
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
            />
          ))}
      </View>
      {divider && <Divider />}
    </>
  );
  return pressable ? (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={style}>
      {body}
    </Pressable>
  ) : (
    <View style={style}>{body}</View>
  );
});

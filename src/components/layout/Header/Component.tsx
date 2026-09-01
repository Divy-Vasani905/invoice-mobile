import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import type { HeaderProps } from './types';

export const Header = memo(function Header({
  title,
  subtitle,
  leftAction,
  rightActions,
  children,
  onBack,
  safeArea = true,
  style,
}: HeaderProps) {
  const { theme } = useTheme();
  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.inputs.layout.gap,
          padding: theme.cards.layout.padding,
          // backgroundColor: theme.colors.surface,
        },
        style,
      ]}
    >
      {leftAction ??
        (onBack != null && (
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack}>
            <Ionicons name="arrow-back" color={theme.colors.primary} size={theme.iconSizes.lg} />
          </Pressable>
        ))}
      <View style={{ flex: 1, gap: theme.inputs.layout.gap }}>
        {title != null && (
          <Text style={[theme.typography.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        )}
        {subtitle != null && (
          <Text style={[theme.typography.helper, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
        {children}
      </View>
      {rightActions}
    </View>
  );
  return safeArea ? <SafeAreaView edges={['top']}>{content}</SafeAreaView> : content;
});

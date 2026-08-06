import { memo } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import type { CardProps } from './types';

export const Card = memo(function Card({
  children,
  header,
  footer,
  variant = 'elevated',
  pressable = false,
  disabled = false,
  loading = false,
  padding = 'lg',
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { theme } = useTheme();
  const token = theme.cards.variants[variant];
  const body = (
    <View style={{ gap: theme.cards.layout.gap }}>
      {header}
      {children}
      {footer}
    </View>
  );
  const container = {
    padding: cStyleValues.spacing[padding],
    borderRadius: theme.cards.layout.radius,
    borderWidth: theme.cards.layout.borderWidth,
    backgroundColor:
      token.background === 'transparent' ? 'transparent' : theme.colors[token.background],
    borderColor: token.border === 'transparent' ? 'transparent' : theme.colors[token.border],
    ...theme.elevation[token.elevation],
  };
  return pressable ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled}
      onPress={onPress}
      style={[container, style]}
    >
      {loading ? <ActivityIndicator color={theme.colors.primary} /> : body}
    </Pressable>
  ) : (
    <View style={[container, style]}>
      {loading ? <ActivityIndicator color={theme.colors.primary} /> : body}
    </View>
  );
});

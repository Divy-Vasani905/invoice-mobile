import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { ListItem } from '@/components/layout/ListItem';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';

import type { SettingsRowTone } from '../types/settings.types';
import type { ReactNode } from 'react';

export interface SettingsRowProps {
  label: string;
  value?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  divider?: boolean;
  tone?: SettingsRowTone;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function SettingsRow({
  label,
  value,
  leading,
  trailing,
  divider = true,
  tone = 'default',
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: SettingsRowProps) {
  const { theme } = useTheme();
  const isPremium = tone === 'premium';
  const resolvedTrailing =
    trailing ??
    (onPress != null ? (
      <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8, cStyle.flexShrink]}>
        {value != null && (
          <ThemedText
            numberOfLines={1}
            style={[theme.typography.helper, { color: theme.colors.textSecondary, maxWidth: 120 }]}
          >
            {value}
          </ThemedText>
        )}
        <Ionicons
          name="chevron-forward"
          color={isPremium ? theme.colors.premium : theme.colors.textTertiary}
          size={theme.iconSizes.md}
          importantForAccessibility="no"
        />
      </View>
    ) : value != null ? (
      <ThemedText
        numberOfLines={1}
        style={[theme.typography.helper, { color: theme.colors.textSecondary }]}
      >
        {value}
      </ThemedText>
    ) : undefined);

  return (
    <ListItem
      title={label}
      titleNumberOfLines={1}
      leading={leading}
      trailing={resolvedTrailing}
      divider={divider}
      pressable={onPress != null}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      style={isPremium ? { backgroundColor: theme.colors.premiumSubtle } : undefined}
    />
  );
}

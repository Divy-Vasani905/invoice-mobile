import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme, cStyle } from '@/theme';

import type { SectionHeaderProps } from './types';

/**
 * Reusable section header component that displays a title and an optional action.
 * Leverages theme tokens and accessibility labels.
 */
export const SectionHeader = memo(function SectionHeader({
  title,
  actionLabel,
  onActionPress,
  style,
  accessibilityLabel,
}: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        cStyle.flexRow,
        cStyle.itemCenter,
        cStyle.justifyBetween,
        cStyle.ph16,
        cStyle.pv8,
        style,
      ]}
      accessible
      accessibilityRole="header"
    >
      <ThemedText
        style={[
          theme.typography.title,
          { color: theme.colors.textPrimary, fontSize: 18, lineHeight: 24 },
        ]}
      >
        {title}
      </ThemedText>

      {actionLabel != null && onActionPress != null && (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? `${actionLabel} for ${title}`}
          hitSlop={8}
          style={({ pressed }) => [
            pressed && cStyle.opacity64,
          ]}
        >
          <ThemedText
            style={[
              theme.typography.label,
              { color: theme.colors.primary },
            ]}
          >
            {actionLabel}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
});

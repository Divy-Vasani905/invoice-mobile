import { memo } from 'react';
import { Image, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { getAvatarStyles } from './styles';

import type { AvatarProps } from './types';

/**
 * Theme-aware user or business image that falls back to initials, then a
 * neutral placeholder when no image is available.
 */
export const Avatar = memo(function Avatar({
  source,
  initials,
  size = 'md',
  accessibilityLabel,
  style,
  ...viewProps
}: AvatarProps) {
  const { theme } = useTheme();
  const styles = getAvatarStyles(theme, size);
  const fallbackLabel = initials ?? '?';

  return (
    <View
      {...viewProps}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? fallbackLabel}
      style={[styles.container, style]}
    >
      {source == null ? (
        <Text style={styles.label}>{fallbackLabel}</Text>
      ) : (
        <Image accessible={false} source={source} resizeMode="cover" style={styles.image} />
      )}
    </View>
  );
});

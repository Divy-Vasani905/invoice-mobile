import { memo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import type { LoaderProps, LoaderVariant } from './types';

/**
 * Tokenized loading indicator for inline, overlay, and full-screen contexts.
 */
export const Loader = memo(function Loader({
  mode = 'inline',
  size = 'md',
  variant = 'primary',
  text,
  style,
}: LoaderProps) {
  const { theme } = useTheme();
  const color = resolveColor(variant, theme.colors);
  const isCovering = mode !== 'inline';

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={text ?? 'Loading'}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.inputs.layout.gap,
          ...(isCovering
            ? {
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundColor:
                  mode === 'overlay' ? theme.colors.overlay : theme.colors.background,
              }
            : {}),
        },
        style,
      ]}
    >
      <ActivityIndicator color={color} size={theme.iconSizes[theme.buttons.sizes[size].iconSize]} />
      {text != null && <Text style={[theme.typography.helper, { color }]}>{text}</Text>}
    </View>
  );
});

function resolveColor(
  variant: LoaderVariant,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  if (variant === 'inverse') return colors.textInverse;
  if (variant === 'neutral') return colors.textSecondary;
  return colors.primary;
}

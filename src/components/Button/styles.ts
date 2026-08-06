import type { ButtonSize, ButtonVariant } from '@/theme';
import type { AppTheme } from '@/theme/types';

import type { TextStyle, ViewStyle } from 'react-native';

type ButtonStyles = {
  container: ViewStyle;
  label: TextStyle;
  iconColor: string;
  iconSize: number;
};

export function getButtonStyles(
  theme: AppTheme,
  variant: ButtonVariant,
  size: ButtonSize,
  pressed: boolean,
): ButtonStyles {
  const sizeToken = theme.buttons.sizes[size];
  const variantToken = theme.buttons.variants[variant];
  const background = pressed ? variantToken.backgroundPressed : variantToken.background;

  return {
    container: {
      minHeight: sizeToken.minHeight,
      paddingHorizontal: sizeToken.paddingHorizontal,
      paddingVertical: sizeToken.paddingVertical,
      gap: sizeToken.gap,
      borderRadius: sizeToken.radius,
      borderWidth: theme.cards.layout.borderWidth,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      backgroundColor: resolveColor(theme, background),
      borderColor: resolveColor(theme, variantToken.border),
    },
    label: {
      ...theme.typography[sizeToken.typography],
      color: resolveColor(theme, variantToken.text),
      textAlign: 'center',
    },
    iconColor: resolveColor(theme, variantToken.text),
    iconSize: theme.iconSizes[sizeToken.iconSize],
  };
}

function resolveColor(
  theme: AppTheme,
  colorToken: keyof AppTheme['colors'] | 'transparent',
): string {
  return colorToken === 'transparent' ? 'transparent' : theme.colors[colorToken];
}

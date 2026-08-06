import type { BadgeSize, BadgeVariant } from '@/theme';
import type { AppTheme } from '@/theme/types';

import type { TextStyle, ViewStyle } from 'react-native';

type BadgeStyles = {
  container: ViewStyle;
  label: TextStyle;
  iconColor: string;
  iconSize: number;
};

export function getBadgeStyles(
  theme: AppTheme,
  variant: BadgeVariant,
  size: BadgeSize,
): BadgeStyles {
  const sizeToken = theme.badges.sizes[size];
  const variantToken = theme.badges.variants[variant];

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
      backgroundColor: theme.colors[variantToken.background],
      borderColor:
        variantToken.border === 'transparent' ? 'transparent' : theme.colors[variantToken.border],
    },
    label: {
      ...theme.typography[sizeToken.typography],
      color: theme.colors[variantToken.text],
    },
    iconColor: theme.colors[variantToken.text],
    iconSize: theme.iconSizes[size === 'sm' ? 'xs' : 'sm'],
  };
}

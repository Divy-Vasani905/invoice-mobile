import type { AvatarSizeToken, TypographyToken } from '@/theme';
import type { AppTheme } from '@/theme/types';

import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

type AvatarStyles = {
  container: ViewStyle;
  image: ImageStyle;
  label: TextStyle;
};

const avatarTypography: Record<AvatarSizeToken, TypographyToken> = {
  xs: 'caption',
  sm: 'label',
  md: 'bodySmall',
  lg: 'bodyMedium',
  xl: 'title',
  '2xl': 'headingS',
  '3xl': 'headingM',
};

export function getAvatarStyles(theme: AppTheme, size: AvatarSizeToken): AvatarStyles {
  const diameter = theme.avatarSizes[size];

  return {
    container: {
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
      borderWidth: theme.cards.layout.borderWidth,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundSubtle,
      borderColor: theme.colors.border,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    label: {
      ...theme.typography[avatarTypography[size]],
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  };
}

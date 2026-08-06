import { getButtonStyles } from '@/components/Button/styles';
import type { ButtonSize, ButtonVariant } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';
import type { AppTheme } from '@/theme/types';

import type { ViewStyle } from 'react-native';

type IconButtonStyles = {
  container: ViewStyle;
  iconColor: string;
  iconSize: number;
};

export function getIconButtonStyles(
  theme: AppTheme,
  variant: ButtonVariant,
  size: ButtonSize,
  pressed: boolean,
): IconButtonStyles {
  const buttonStyles = getButtonStyles(theme, variant, size, pressed);

  return {
    container: {
      ...buttonStyles.container,
      minWidth: theme.buttons.sizes[size].minHeight,
      paddingHorizontal: cStyleValues.spacing.none,
    },
    iconColor: buttonStyles.iconColor,
    iconSize: buttonStyles.iconSize,
  };
}

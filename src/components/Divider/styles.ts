import { cStyleValues, type SpacingToken } from '@/theme/cStyle';
import type { AppTheme } from '@/theme/types';

import type { DividerOrientation, DividerThickness } from './types';
import type { ViewStyle } from 'react-native';

export function getDividerStyle(
  theme: AppTheme,
  orientation: DividerOrientation,
  thickness: DividerThickness,
  inset?: SpacingToken,
): ViewStyle {
  const thicknessValue = thickness === 'thin' ? cStyleValues.spacing.xxs : cStyleValues.spacing.xs;
  const insetValue = inset == null ? cStyleValues.spacing.none : cStyleValues.spacing[inset];

  return orientation === 'horizontal'
    ? {
        alignSelf: 'stretch',
        height: thicknessValue,
        marginHorizontal: insetValue,
        backgroundColor: theme.colors.divider,
      }
    : {
        alignSelf: 'stretch',
        width: thicknessValue,
        marginVertical: insetValue,
        backgroundColor: theme.colors.divider,
      };
}

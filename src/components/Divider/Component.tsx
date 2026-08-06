import { memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { getDividerStyle } from './styles';

import type { DividerProps } from './types';

/**
 * Decorative semantic separator for horizontal or vertical layouts.
 */
export const Divider = memo(function Divider({
  orientation = 'horizontal',
  thickness = 'thin',
  inset,
  style,
  ...viewProps
}: DividerProps) {
  const { theme } = useTheme();

  return (
    <View
      {...viewProps}
      accessible={false}
      importantForAccessibility="no"
      style={[getDividerStyle(theme, orientation, thickness, inset), style]}
    />
  );
});

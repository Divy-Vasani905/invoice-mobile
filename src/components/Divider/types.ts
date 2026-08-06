import type { SpacingToken } from '@/theme/cStyle';

import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerThickness = 'thin' | 'medium';

export interface DividerProps extends Omit<ViewProps, 'accessible' | 'style'> {
  orientation?: DividerOrientation;
  thickness?: DividerThickness;
  inset?: SpacingToken;
  style?: StyleProp<ViewStyle>;
}

import type { CardVariant } from '@/theme';
import type { SpacingToken } from '@/theme/cStyle';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface CardProps {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  variant?: CardVariant;
  pressable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  padding?: SpacingToken;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}

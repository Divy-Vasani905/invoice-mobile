import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightActions?: ReactNode;
  children?: ReactNode;
  onBack?: () => void;
  safeArea?: boolean;
  style?: StyleProp<ViewStyle>;
}

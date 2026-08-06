import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  badge?: ReactNode;
  status?: ReactNode;
  divider?: boolean;
  pressable?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

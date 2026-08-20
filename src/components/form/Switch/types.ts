import type { StyleProp, ViewStyle } from 'react-native';

export interface SwitchProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

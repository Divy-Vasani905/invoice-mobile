import type { StyleProp, ViewStyle } from 'react-native';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  errorMessage?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

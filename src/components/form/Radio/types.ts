import type { StyleProp, ViewStyle } from 'react-native';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioItemProps extends RadioOption {
  checked: boolean;
  onPress?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

export interface RadioGroupProps {
  options: readonly RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

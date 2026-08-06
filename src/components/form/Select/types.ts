import type { FormControlSize } from '@/components/form/shared/types';

import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<ViewProps, 'style'> {
  options: readonly SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  onOpen?: () => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  size?: FormControlSize;
  containerStyle?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
}

import type { FormControlSize, FormIconRenderer } from '@/components/form/shared/types';

import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'editable' | 'style'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: FormControlSize;
  leftIcon?: FormIconRenderer;
  rightIcon?: FormIconRenderer;
  prefix?: string;
  suffix?: string;
  clearable?: boolean;
  onClear?: () => void;
  showCharacterCount?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

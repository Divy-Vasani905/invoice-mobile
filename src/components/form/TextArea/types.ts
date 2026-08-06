import type { FormControlSize } from '@/components/form/shared/types';

import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface TextAreaProps extends Omit<TextInputProps, 'editable' | 'multiline' | 'style'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  size?: FormControlSize;
  autoGrow?: boolean;
  showCharacterCount?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

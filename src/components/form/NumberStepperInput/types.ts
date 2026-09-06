import type { InputProps } from '../Input/types';

export interface NumberStepperInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'leftIcon' | 'rightIcon'> {
  value?: string | number;
  onChangeValue?: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  decimalPlaces?: number;
}

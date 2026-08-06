import type { ButtonSize, ButtonVariant } from '@/theme';

import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';

export type ButtonIconRenderer = (props: { color: string; size: number }) => ReactNode;

export interface ButtonProps extends Omit<PressableProps, 'children' | 'disabled' | 'style'> {
  label: string;
  variant?: Exclude<ButtonVariant, 'disabled'>;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ButtonIconRenderer;
  rightIcon?: ButtonIconRenderer;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

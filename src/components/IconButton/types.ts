import type { ButtonSize, ButtonVariant } from '@/theme';

import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

export type IconButtonIconRenderer = (props: { color: string; size: number }) => ReactNode;

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'disabled' | 'style'> {
  icon: IconButtonIconRenderer;
  accessibilityLabel: string;
  variant?: Exclude<ButtonVariant, 'disabled'>;
  size?: ButtonSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

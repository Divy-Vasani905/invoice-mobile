import type { ButtonProps } from '@/components/Button';

import type { ReactNode } from 'react';
import type { ModalProps as NativeModalProps, StyleProp, ViewStyle } from 'react-native';

export type FeedbackModalSize = 'sm' | 'md' | 'lg';
export type FeedbackModalVariant = 'default' | 'confirmation' | 'destructive';

export interface FeedbackModalProps extends Pick<
  NativeModalProps,
  'animationType' | 'onRequestClose' | 'transparent' | 'visible'
> {
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  primaryAction?: Pick<ButtonProps, 'label' | 'onPress' | 'loading' | 'disabled'>;
  secondaryAction?: Pick<ButtonProps, 'label' | 'onPress' | 'loading' | 'disabled'>;
  closable?: boolean;
  loading?: boolean;
  size?: FeedbackModalSize;
  variant?: FeedbackModalVariant;
  contentStyle?: StyleProp<ViewStyle>;
}

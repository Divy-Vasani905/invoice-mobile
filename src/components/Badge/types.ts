import type { BadgeSize, BadgeVariant } from '@/theme';

import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';

export type BadgeIconRenderer = (props: { color: string; size: number }) => ReactNode;

export interface BadgeProps extends Omit<ViewProps, 'accessible' | 'style'> {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: BadgeIconRenderer;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

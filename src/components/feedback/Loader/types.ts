import type { ButtonSize } from '@/theme';

import type { StyleProp, ViewStyle } from 'react-native';

export type LoaderVariant = 'primary' | 'neutral' | 'inverse';
export type LoaderMode = 'inline' | 'overlay' | 'fullScreen';

export interface LoaderProps {
  mode?: LoaderMode;
  size?: ButtonSize;
  variant?: LoaderVariant;
  text?: string;
  style?: StyleProp<ViewStyle>;
}

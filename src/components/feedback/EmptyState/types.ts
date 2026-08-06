import type { ButtonProps } from '@/components/Button';
import type { FormIconRenderer } from '@/components/form/shared/types';

import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

export type EmptyStateVariant = 'default' | 'search' | 'offline';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: FormIconRenderer;
  image?: ImageSourcePropType;
  primaryAction?: Pick<ButtonProps, 'label' | 'onPress' | 'loading' | 'disabled'>;
  secondaryAction?: Pick<ButtonProps, 'label' | 'onPress' | 'loading' | 'disabled'>;
  variant?: EmptyStateVariant;
  style?: StyleProp<ViewStyle>;
}

import type { AvatarSizeToken } from '@/theme';

import type { ImageSourcePropType, StyleProp, ViewProps, ViewStyle } from 'react-native';

export interface AvatarProps extends Omit<ViewProps, 'accessible' | 'style'> {
  source?: ImageSourcePropType;
  initials?: string;
  size?: AvatarSizeToken;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

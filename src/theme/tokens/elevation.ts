import { Platform, type ViewStyle } from 'react-native';

import { opacity } from '@/theme/cStyle';

/**
 * Cross-platform elevation tokens.
 * Android uses elevation; iOS/web use shadow* properties.
 */
export type ElevationStyle = Pick<
  ViewStyle,
  'elevation' | 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius'
>;

const createElevation = (
  androidElevation: number,
  ios: {
    offsetY: number;
    opacity: number;
    radius: number;
  },
): ElevationStyle =>
  Platform.select<ElevationStyle>({
    android: {
      elevation: androidElevation,
      shadowColor: '#000000',
    },
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: ios.offsetY },
      shadowOpacity: ios.opacity,
      shadowRadius: ios.radius,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: ios.offsetY },
      shadowOpacity: ios.opacity,
      shadowRadius: ios.radius,
      elevation: androidElevation,
    },
  })!;

export const elevation = {
  none: createElevation(0, {
    offsetY: 0,
    opacity: opacity.transparent,
    radius: 0,
  }),
  xs: createElevation(1, {
    offsetY: 1,
    opacity: opacity.subtle,
    radius: 2,
  }),
  sm: createElevation(2, {
    offsetY: 1,
    opacity: opacity.muted,
    radius: 3,
  }),
  md: createElevation(4, {
    offsetY: 2,
    opacity: opacity.soft,
    radius: 6,
  }),
  lg: createElevation(8, {
    offsetY: 4,
    opacity: opacity.medium,
    radius: 12,
  }),
  xl: createElevation(12, {
    offsetY: 8,
    opacity: opacity.medium,
    radius: 16,
  }),
  '2xl': createElevation(16, {
    offsetY: 12,
    opacity: opacity.strong,
    radius: 24,
  }),
} as const;

export type ElevationToken = keyof typeof elevation;

/**
 * Icon size scale (square, in density-independent pixels).
 */
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export type IconSizeToken = keyof typeof iconSizes;
export type IconSizeValue = (typeof iconSizes)[IconSizeToken];

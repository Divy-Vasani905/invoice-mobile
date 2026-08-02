/**
 * Avatar diameter scale (in density-independent pixels).
 */
export const avatarSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
  '3xl': 96,
} as const;

export type AvatarSizeToken = keyof typeof avatarSizes;
export type AvatarSizeValue = (typeof avatarSizes)[AvatarSizeToken];

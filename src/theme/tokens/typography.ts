import { fonts, fontWeights, type FontWeightValue } from '@/theme/tokens/fonts';

/**
 * Type scale primitives — no magic numbers in components.
 */
export const fontSizes = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 40,
  '7xl': 48,
} as const;

export const lineHeights = {
  tight: 1.15,
  snug: 1.25,
  normal: 1.4,
  relaxed: 1.55,
} as const;

export const letterSpacings = {
  tighter: -0.4,
  tight: -0.2,
  normal: 0,
  wide: 0.2,
  wider: 0.4,
  widest: 0.8,
} as const;

export type FontSizeToken = keyof typeof fontSizes;
export type LineHeightToken = keyof typeof lineHeights;
export type LetterSpacingToken = keyof typeof letterSpacings;

export type TypographyStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeightValue;
  lineHeight: number;
  letterSpacing: number;
};

const createTypeStyle = (
  size: FontSizeToken,
  weight: keyof typeof fontWeights,
  lineHeight: LineHeightToken,
  letterSpacing: LetterSpacingToken,
  family: keyof typeof fonts = 'regular',
): TypographyStyle => {
  const fontSize = fontSizes[size];

  return {
    fontFamily: fonts[family],
    fontSize,
    fontWeight: fontWeights[weight],
    lineHeight: Math.round(fontSize * lineHeights[lineHeight]),
    letterSpacing: letterSpacings[letterSpacing],
  };
};

/**
 * Semantic typography roles for the design system.
 */
export const typography = {
  display: createTypeStyle('7xl', 'bold', 'tight', 'tighter', 'bold'),

  headingXl: createTypeStyle('6xl', 'bold', 'tight', 'tight', 'bold'),
  headingL: createTypeStyle('5xl', 'bold', 'snug', 'tight', 'bold'),
  headingM: createTypeStyle('4xl', 'semibold', 'snug', 'tight', 'semibold'),
  headingS: createTypeStyle('3xl', 'semibold', 'snug', 'normal', 'semibold'),

  title: createTypeStyle('2xl', 'semibold', 'snug', 'normal', 'semibold'),

  bodyLarge: createTypeStyle('xl', 'regular', 'relaxed', 'normal'),
  bodyMedium: createTypeStyle('lg', 'regular', 'relaxed', 'normal'),
  bodySmall: createTypeStyle('md', 'regular', 'relaxed', 'normal'),

  caption: createTypeStyle('sm', 'regular', 'normal', 'wide'),
  label: createTypeStyle('sm', 'medium', 'normal', 'wide', 'medium'),
  button: createTypeStyle('lg', 'semibold', 'tight', 'wide', 'semibold'),
  input: createTypeStyle('lg', 'regular', 'normal', 'normal'),
  error: createTypeStyle('sm', 'medium', 'normal', 'normal', 'medium'),
  helper: createTypeStyle('sm', 'regular', 'normal', 'normal'),
} as const;

export type TypographyToken = keyof typeof typography;

/**
 * Font family architecture.
 *
 * Fonts are NOT installed yet. Switch `activeFontFamily` later to load
 * Inter, Poppins, or Roboto via expo-font without rewriting typography tokens.
 */

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontWeightToken = keyof typeof fontWeights;
export type FontWeightValue = (typeof fontWeights)[FontWeightToken];

export type FontFamilyRole =
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'mono';

export type FontFamilyMap = Record<FontFamilyRole, string>;

/**
 * Named font packs ready for future expo-font registration.
 * Keys match the PostScript / file names you will register.
 */
export const fontFamilies = {
  system: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'monospace',
  },
  inter: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    mono: 'Inter-Regular',
  },
  poppins: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    mono: 'Poppins-Regular',
  },
  roboto: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    mono: 'Roboto-Regular',
  },
} as const satisfies Record<string, FontFamilyMap>;

export type FontFamilyPack = keyof typeof fontFamilies;

/**
 * Change this single constant when custom fonts are installed.
 * Typography tokens resolve families through `fonts` below.
 */
export const activeFontFamily: FontFamilyPack = 'system';

export const fonts: FontFamilyMap = fontFamilies[activeFontFamily];

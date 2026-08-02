/**
 * Primitive color palette — raw values only.
 * Components must consume semantic tokens from light/dark themes, never these directly.
 *
 * Brand aligns with the existing splash accent (#208AEF) while expanding into a full scale.
 */
export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  navy: {
    950: '#070B14',
    900: '#0C1220',
    800: '#121A2B',
    700: '#1A2438',
    600: '#243049',
    500: '#334463',
    400: '#4A5D7A',
    300: '#6B7C96',
    200: '#9AA8BB',
    100: '#C5CEDA',
    50: '#E8ECF2',
  },

  gray: {
    950: '#0F1115',
    900: '#171A1F',
    800: '#1F242B',
    700: '#2A313A',
    600: '#3C4654',
    500: '#5B6776',
    400: '#7E8A99',
    300: '#A3ADB8',
    200: '#C8D0D8',
    100: '#E4E8ED',
    50: '#F4F6F8',
  },

  blue: {
    900: '#0B3B7A',
    800: '#0F4FA3',
    700: '#1563C7',
    600: '#1B78E8',
    500: '#208AEF',
    400: '#4BA3F4',
    300: '#7BBCF7',
    200: '#AED6FB',
    100: '#D6EBFD',
    50: '#EBF5FE',
  },

  teal: {
    700: '#0F766E',
    600: '#0D9488',
    500: '#14B8A6',
    400: '#2DD4BF',
    100: '#CCFBF1',
    50: '#F0FDFA',
  },

  green: {
    700: '#15803D',
    600: '#16A34A',
    500: '#22C55E',
    400: '#4ADE80',
    100: '#DCFCE7',
    50: '#F0FDF4',
  },

  amber: {
    700: '#B45309',
    600: '#D97706',
    500: '#F59E0B',
    400: '#FBBF24',
    100: '#FEF3C7',
    50: '#FFFBEB',
  },

  red: {
    700: '#B91C1C',
    600: '#DC2626',
    500: '#EF4444',
    400: '#F87171',
    100: '#FEE2E2',
    50: '#FEF2F2',
  },

  violet: {
    700: '#6D28D9',
    600: '#7C3AED',
    500: '#8B5CF6',
    400: '#A78BFA',
    100: '#EDE9FE',
    50: '#F5F3FF',
  },

  orange: {
    700: '#C2410C',
    600: '#EA580C',
    500: '#F97316',
    400: '#FB923C',
    100: '#FFEDD5',
    50: '#FFF7ED',
  },

  gold: {
    700: '#A16207',
    600: '#CA8A04',
    500: '#EAB308',
    400: '#FACC15',
    100: '#FEF9C3',
    50: '#FEFCE8',
  },
} as const;

export type Palette = typeof palette;

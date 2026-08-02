import { darkColors, lightColors } from '@/theme/colors';
import {
  animationDuration,
  animationEasing,
  avatarSizes,
  badgeTokens,
  buttonTokens,
  cardTokens,
  elevation,
  fonts,
  iconSizes,
  inputTokens,
  typography,
} from '@/theme/tokens';
import type { AppTheme, ThemeMode } from '@/theme/types';

/**
 * Theme holds light/dark-aware and semantic design data only.
 * Layout CSS utilities live in `cStyle.ts` — use `cStyle.p16`, `cStyle.flexRow`, etc.
 */
const sharedTokens = {
  elevation,
  typography,
  fonts,
  iconSizes,
  avatarSizes,
  animation: {
    duration: animationDuration,
    easing: animationEasing,
  },
  buttons: buttonTokens,
  inputs: inputTokens,
  cards: cardTokens,
  badges: badgeTokens,
} as const;

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightColors,
  ...sharedTokens,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkColors,
  ...sharedTokens,
};

export const themes: Record<ThemeMode, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

export function getTheme(mode: ThemeMode): AppTheme {
  return themes[mode];
}

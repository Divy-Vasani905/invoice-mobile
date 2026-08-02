import { createContext } from 'react';

import { lightTheme } from '@/theme/themes';
import type { AppTheme, ThemeMode, ThemePreference } from '@/theme/types';

export type ThemeContextValue = {
  /** Fully resolved theme object for the active appearance. */
  theme: AppTheme;
  /** Convenience alias for `theme.colors`. */
  colors: AppTheme['colors'];
  /** Convenience alias for `theme.typography`. */
  typography: AppTheme['typography'];
  /** Convenience alias for `theme.elevation`. */
  elevation: AppTheme['elevation'];
  /** Convenience aliases for prepared component tokens. */
  buttons: AppTheme['buttons'];
  inputs: AppTheme['inputs'];
  cards: AppTheme['cards'];
  badges: AppTheme['badges'];
  /** Resolved appearance after applying preference + system scheme. */
  mode: ThemeMode;
  /** User preference: light, dark, or follow system. */
  preference: ThemePreference;
  isDark: boolean;
  /** Flip between explicit light and dark (exits system mode). */
  toggleTheme: () => void;
  /** Set light, dark, or system preference (persisted). */
  setThemePreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const defaultThemeContextValue: ThemeContextValue = {
  theme: lightTheme,
  colors: lightTheme.colors,
  typography: lightTheme.typography,
  elevation: lightTheme.elevation,
  buttons: lightTheme.buttons,
  inputs: lightTheme.inputs,
  cards: lightTheme.cards,
  badges: lightTheme.badges,
  mode: 'light',
  preference: 'system',
  isDark: false,
  toggleTheme: () => {
    throw new Error('ThemeProvider is missing. Wrap your app with ThemeProvider.');
  },
  setThemePreference: () => {
    throw new Error('ThemeProvider is missing. Wrap your app with ThemeProvider.');
  },
};

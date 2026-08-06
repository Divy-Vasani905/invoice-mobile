import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

import type { AppTheme } from '@/theme';

/**
 * Bridges the app design system onto the React Navigation theme so navigator
 * chrome (headers, tab bars, screen backgrounds, back gestures) follows the
 * same semantic colors as the rest of the app.
 */
export function createNavigationTheme(theme: AppTheme): Theme {
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    dark: theme.mode === 'dark',
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}

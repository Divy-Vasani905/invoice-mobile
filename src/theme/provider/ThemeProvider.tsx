import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  getStoredThemePreference,
  setStoredThemePreference,
} from '@/theme/persistence/theme-preference';
import {
  defaultThemeContextValue,
  ThemeContext,
  type ThemeContextValue,
} from '@/theme/provider/ThemeContext';
import { getTheme } from '@/theme/themes';
import type { ThemeMode, ThemePreference } from '@/theme/types';

function resolveMode(
  preference: ThemePreference,
  systemScheme: string | null | undefined,
): ThemeMode {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}

export type ThemeProviderProps = PropsWithChildren<{
  /** Override initial preference (useful for tests). Defaults to persisted value. */
  initialPreference?: ThemePreference;
}>;

/**
 * Production Theme Provider.
 * Supports light / dark / system, and persists the user preference locally via MMKV.
 */
export function ThemeProvider({ children, initialPreference }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(
    () => initialPreference ?? getStoredThemePreference(),
  );

  useEffect(() => {
    if (initialPreference != null) {
      return;
    }

    setPreference(getStoredThemePreference());
  }, [initialPreference]);

  const mode = resolveMode(preference, systemScheme);
  const theme = getTheme(mode);
  const isDark = mode === 'dark';

  const setThemePreference = useCallback((next: ThemePreference) => {
    setPreference(next);
    setStoredThemePreference(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setThemePreference(next);
  }, [mode, setThemePreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: theme.colors,
      typography: theme.typography,
      elevation: theme.elevation,
      buttons: theme.buttons,
      inputs: theme.inputs,
      cards: theme.cards,
      badges: theme.badges,
      mode,
      preference,
      isDark,
      toggleTheme,
      setThemePreference,
    }),
    [theme, mode, preference, isDark, toggleTheme, setThemePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export { defaultThemeContextValue };

import { useContext } from 'react';

import { ThemeContext, type ThemeContextValue } from '@/theme/provider/ThemeContext';

/**
 * Access the active design system theme and preference controls.
 * Must be used under `ThemeProvider`.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context == null) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }

  return context;
}

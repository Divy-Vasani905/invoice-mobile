import { useMemo } from 'react';

import {
  createFormSheetScreenOptions,
  createFullScreenModalScreenOptions,
  createModalScreenOptions,
  createStackScreenOptions,
  type HeaderOptionsInput,
  type ModalOptionsInput,
} from '@/navigation/config/screen-options';
import { createTabScreenOptions } from '@/navigation/config/tab-options';
import { useResponsiveNavigation } from '@/navigation/hooks/use-responsive-navigation';
import type { StackScreenOptions, TabScreenOptions } from '@/navigation/types';
import { useTheme } from '@/theme';

/** Theme-aware baseline options for a `Stack` navigator. */
export function useStackScreenOptions(overrides?: StackScreenOptions): StackScreenOptions {
  const { theme } = useTheme();

  return useMemo(() => ({ ...createStackScreenOptions(theme), ...overrides }), [theme, overrides]);
}

/** Theme-aware baseline options for the `Tabs` navigator. */
export function useTabScreenOptions(overrides?: TabScreenOptions): TabScreenOptions {
  const { theme } = useTheme();
  const layout = useResponsiveNavigation();

  return useMemo(
    () => ({ ...createTabScreenOptions(theme, layout), ...overrides }),
    [theme, layout, overrides],
  );
}

/**
 * Builders for the three modal presentations the app uses. Returned as a
 * stable object so layouts can configure several modal screens at once.
 */
export function useModalScreenOptions() {
  const { theme } = useTheme();

  return useMemo(
    () => ({
      modal: (input: HeaderOptionsInput) => createModalScreenOptions(theme, input),
      formSheet: (input: ModalOptionsInput) => createFormSheetScreenOptions(theme, input),
      fullScreen: (input: HeaderOptionsInput) => createFullScreenModalScreenOptions(theme, input),
    }),
    [theme],
  );
}

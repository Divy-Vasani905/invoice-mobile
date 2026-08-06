import { cStyleValues } from '@/theme/cStyle';

/**
 * Navigation size classes.
 *
 * - `compact`  — phones in portrait
 * - `medium`   — large phones in landscape, small tablets
 * - `expanded` — tablets and desktop-class windows
 */
export type NavigationSizeClass = 'compact' | 'medium' | 'expanded';

/** Window-width thresholds (dp) that select a size class. */
export const NAVIGATION_BREAKPOINTS = {
  medium: 600,
  expanded: 905,
} as const;

/**
 * Navigation chrome is measured in multiples of this unit instead of fixed
 * pixel values, so the shell scales with the design system spacing scale.
 */
export const NAVIGATION_UNIT = cStyleValues.spacing.lg;

/** Tab bar content height, excluding the bottom safe-area inset. */
export const TAB_BAR_HEIGHT_UNITS: Record<NavigationSizeClass, number> = {
  compact: 3.5,
  medium: 4,
  expanded: 4.5,
};

/** Shorter bar when vertical space is scarce (phones held in landscape). */
export const TAB_BAR_HEIGHT_UNITS_LANDSCAPE = 3;

/** Diameter of the centre floating action button. */
export const FAB_SIZE_UNITS: Record<NavigationSizeClass, number> = {
  compact: 3.5,
  medium: 3.75,
  expanded: 4,
};

/** Fraction of the FAB that floats above the tab bar's top edge. */
export const FAB_LIFT_RATIO = 0.34;

/** Share of the window width taken by the tab sidebar on expanded windows. */
export const SIDEBAR_WIDTH_RATIO = 0.24;

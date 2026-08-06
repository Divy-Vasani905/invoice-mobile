export {
  FAB_LIFT_RATIO,
  FAB_SIZE_UNITS,
  NAVIGATION_BREAKPOINTS,
  NAVIGATION_UNIT,
  SIDEBAR_WIDTH_RATIO,
  TAB_BAR_HEIGHT_UNITS,
  TAB_BAR_HEIGHT_UNITS_LANDSCAPE,
} from '@/navigation/constants/breakpoints';
export type { NavigationSizeClass } from '@/navigation/constants/breakpoints';

export { ROUTE_NAMES, ROUTES } from '@/navigation/constants/routes';

export { createNavigationTheme } from '@/navigation/config/navigation-theme';

export {
  createFormSheetScreenOptions,
  createFullScreenModalScreenOptions,
  createHeaderOptions,
  createModalScreenOptions,
  createStackScreenOptions,
  HEADERLESS_SCREEN_OPTIONS,
} from '@/navigation/config/screen-options';
export type { HeaderOptionsInput, ModalOptionsInput } from '@/navigation/config/screen-options';

export { createTabScreenOptions, TAB_ITEMS } from '@/navigation/config/tab-options';
export type { TabIconName, TabItem } from '@/navigation/config/tab-options';

export { useResponsiveNavigation } from '@/navigation/hooks/use-responsive-navigation';
export type { ResponsiveNavigation } from '@/navigation/hooks/use-responsive-navigation';

export {
  useModalScreenOptions,
  useStackScreenOptions,
  useTabScreenOptions,
} from '@/navigation/hooks/use-screen-options';

export { useNavigationGuards } from '@/navigation/guards/use-navigation-guards';
export type { NavigationGuards } from '@/navigation/guards/use-navigation-guards';

export { ScreenPlaceholder } from '@/navigation/components/screen-placeholder';
export { TabBarFab } from '@/navigation/components/tab-bar-fab';

export type { ModalPresentation, StackScreenOptions, TabScreenOptions } from '@/navigation/types';

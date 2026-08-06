import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { type EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FAB_LIFT_RATIO,
  FAB_SIZE_UNITS,
  NAVIGATION_BREAKPOINTS,
  NAVIGATION_UNIT,
  type NavigationSizeClass,
  SIDEBAR_WIDTH_RATIO,
  TAB_BAR_HEIGHT_UNITS,
  TAB_BAR_HEIGHT_UNITS_LANDSCAPE,
} from '@/navigation/constants/breakpoints';
import { iconSizes } from '@/theme/tokens';

export type ResponsiveNavigation = {
  sizeClass: NavigationSizeClass;
  isLandscape: boolean;
  insets: EdgeInsets;
  /** Tabs become a sidebar once the window is wide enough to carry one. */
  tabBarPosition: 'bottom' | 'left';
  tabBarLabelPosition: 'below-icon' | 'beside-icon';
  /** Full tab bar height including the bottom safe-area inset. */
  tabBarHeight: number;
  /** Bottom safe-area padding the tab bar has to absorb itself. */
  tabBarBottomInset: number;
  tabBarWidth: number | undefined;
  tabIconSize: number;
  fabSize: number;
  /** Distance the FAB is raised above the tab bar's top edge. */
  fabLift: number;
};

function resolveSizeClass(width: number): NavigationSizeClass {
  if (width >= NAVIGATION_BREAKPOINTS.expanded) {
    return 'expanded';
  }

  if (width >= NAVIGATION_BREAKPOINTS.medium) {
    return 'medium';
  }

  return 'compact';
}

/**
 * Derives every navigation dimension from the live window size, the safe-area
 * insets and the design system spacing scale. Nothing here is hardcoded to a
 * particular device, so phones, large phones, landscape and tablets all get a
 * proportionate navigation shell.
 */
export function useResponsiveNavigation(): ResponsiveNavigation {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo<ResponsiveNavigation>(() => {
    const sizeClass = resolveSizeClass(width);
    const isLandscape = width > height;
    const isSidebar = sizeClass === 'expanded';

    const heightUnits =
      isLandscape && sizeClass === 'compact'
        ? TAB_BAR_HEIGHT_UNITS_LANDSCAPE
        : TAB_BAR_HEIGHT_UNITS[sizeClass];

    const barContentHeight = heightUnits * NAVIGATION_UNIT;
    const fabSize = FAB_SIZE_UNITS[sizeClass] * NAVIGATION_UNIT;
    const tabBarBottomInset = isSidebar ? 0 : insets.bottom;

    return {
      sizeClass,
      isLandscape,
      insets,
      tabBarPosition: isSidebar ? 'left' : 'bottom',
      tabBarLabelPosition: isSidebar ? 'beside-icon' : 'below-icon',
      tabBarHeight: barContentHeight + tabBarBottomInset,
      tabBarBottomInset,
      tabBarWidth: isSidebar ? Math.round(width * SIDEBAR_WIDTH_RATIO) : undefined,
      tabIconSize: sizeClass === 'compact' ? iconSizes.lg : iconSizes.xl,
      fabSize,
      fabLift: isSidebar ? 0 : Math.round(fabSize * FAB_LIFT_RATIO),
    };
  }, [width, height, insets]);
}

import { ROUTES } from '@/navigation/constants/routes';
import type { ResponsiveNavigation } from '@/navigation/hooks/use-responsive-navigation';
import type { TabScreenOptions } from '@/navigation/types';
import type { AppTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import type Ionicons from '@expo/vector-icons/Ionicons';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';

export type TabIconName = ComponentProps<typeof Ionicons>['name'];

/**
 * A destination tab, or the centre action slot that opens a modal instead of
 * switching tabs.
 */
export type TabItem =
  | {
      kind: 'tab';
      name: string;
      title: string;
      icon: TabIconName;
      activeIcon: TabIconName;
    }
  | {
      kind: 'action';
      name: string;
      title: string;
      href: Href;
    };

/**
 * Tab bar contents in render order. The `action` entry sits in the middle and
 * is drawn as the floating action button.
 */
export const TAB_ITEMS: readonly TabItem[] = [
  {
    kind: 'tab',
    name: 'dashboard',
    title: 'Dashboard',
    icon: 'grid-outline',
    activeIcon: 'grid',
  },
  {
    kind: 'tab',
    name: 'invoices',
    title: 'Invoices',
    icon: 'document-text-outline',
    activeIcon: 'document-text',
  },
  {
    kind: 'action',
    name: 'create',
    title: 'Create Invoice',
    href: ROUTES.createInvoice,
  },
  {
    kind: 'tab',
    name: 'customers',
    title: 'Customers',
    icon: 'people-outline',
    activeIcon: 'people',
  },
  {
    kind: 'tab',
    name: 'settings',
    title: 'Settings',
    icon: 'settings-outline',
    activeIcon: 'settings',
  },
];

/**
 * Shared tab bar configuration. Sizing comes from `useResponsiveNavigation`,
 * so the same options serve phones, landscape and tablet sidebars.
 */
export function createTabScreenOptions(
  theme: AppTheme,
  layout: ResponsiveNavigation,
): TabScreenOptions {
  const isSidebar = layout.tabBarPosition === 'left';

  return {
    headerShown: false,
    tabBarPosition: layout.tabBarPosition,
    tabBarLabelPosition: layout.tabBarLabelPosition,
    tabBarVariant: isSidebar ? 'material' : 'uikit',
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textTertiary,
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.divider,
      ...(isSidebar
        ? { width: layout.tabBarWidth, borderRightColor: theme.colors.divider }
        : { height: layout.tabBarHeight, paddingBottom: layout.tabBarBottomInset }),
    },
    tabBarItemStyle: {
      paddingVertical: cStyleValues.spacing.xs,
    },
    tabBarLabelStyle: {
      fontFamily: theme.typography.label.fontFamily,
      fontSize: theme.typography.label.fontSize,
      fontWeight: theme.typography.label.fontWeight,
    },
    sceneStyle: {
      backgroundColor: theme.colors.background,
    },
  };
}

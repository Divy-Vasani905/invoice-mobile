import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname, type Href } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { ROUTES } from '@/navigation';
import { TabBarFab } from '@/navigation/components/tab-bar-fab';
import { TAB_ITEMS } from '@/navigation/config/tab-options';
import { useResponsiveNavigation } from '@/navigation/hooks/use-responsive-navigation';
import { useTabScreenOptions } from '@/navigation/hooks/use-screen-options';

export const unstable_settings = {
  anchor: 'dashboard',
};

const TAB_ROOT_HREFS: Record<string, Href> = {
  dashboard: ROUTES.dashboard,
  invoices: ROUTES.invoices,
  customers: ROUTES.customers,
  settings: ROUTES.settings,
};

function isAtHref(pathname: string, href: Href): boolean {
  const path = String(href);
  return pathname === path || pathname === `${path}/`;
}

function isUnderTab(pathname: string, tabName: string): boolean {
  return pathname === `/${tabName}` || pathname.startsWith(`/${tabName}/`);
}

function isAnyTabRoot(pathname: string): boolean {
  return Object.values(TAB_ROOT_HREFS).some((href) => isAtHref(pathname, href));
}

/**
 * Bottom tab shell. Tab order follows `TAB_ITEMS`, which places the create
 * action in the middle where it is drawn as a floating action button.
 */
export default function TabsLayout() {
  const screenOptions = useTabScreenOptions();
  const { tabIconSize } = useResponsiveNavigation();
  const pathname = usePathname();

  return (
    <Tabs backBehavior="history" screenOptions={screenOptions}>
      {TAB_ITEMS.map((item) => {
        if (item.kind !== 'tab') {
          return (
            <Tabs.Screen
              key={item.name}
              name={item.name}
              options={{
                title: item.title,
                tabBarLabel: () => null,
                tabBarButton: ({ testID }) => (
                  <TabBarFab destination={item.href} label={item.title} testID={testID} />
                ),
              }}
            />
          );
        }

        const rootHref = TAB_ROOT_HREFS[item.name];

        return (
          <Tabs.Screen
            key={item.name}
            name={item.name}
            options={{
              title: item.title,
              tabBarAccessibilityLabel: item.title,
              popToTopOnBlur: true,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? item.activeIcon : item.icon}
                  size={tabIconSize}
                  color={color}
                />
              ),
            }}
            listeners={
              rootHref != null
                ? ({ navigation }) => ({
                    tabPress: (event) => {
                      event.preventDefault();

                      if (isAtHref(pathname, rootHref)) {
                        return;
                      }

                      // Nested screen: replace it so Back cannot return here.
                      if (!isAnyTabRoot(pathname) || isUnderTab(pathname, item.name)) {
                        router.replace(rootHref);
                        return;
                      }

                      // Another tab's root. JUMP_TO switches tabs without
                      // pushing. router.navigate() would push Settings on top
                      // of leftover Business Profile, so Back would reopen it.
                      navigation.dispatch({
                        type: 'JUMP_TO',
                        payload: { name: item.name },
                      });
                      queueMicrotask(() => {
                        router.replace(rootHref);
                      });
                    },
                  })
                : undefined
            }
          />
        );
      })}
    </Tabs>
  );
}

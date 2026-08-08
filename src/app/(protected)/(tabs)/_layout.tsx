import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { ROUTES } from '@/navigation';
import { TabBarFab } from '@/navigation/components/tab-bar-fab';
import { TAB_ITEMS } from '@/navigation/config/tab-options';
import { useResponsiveNavigation } from '@/navigation/hooks/use-responsive-navigation';
import { useTabScreenOptions } from '@/navigation/hooks/use-screen-options';

export const unstable_settings = {
  anchor: 'dashboard',
};

/**
 * Bottom tab shell. Tab order follows `TAB_ITEMS`, which places the create
 * action in the middle where it is drawn as a floating action button.
 */
export default function TabsLayout() {
  const screenOptions = useTabScreenOptions();
  const { tabIconSize } = useResponsiveNavigation();

  return (
    <Tabs screenOptions={screenOptions}>
      {TAB_ITEMS.map((item) =>
        item.kind === 'tab' ? (
          <Tabs.Screen
            key={item.name}
            name={item.name}
            options={{
              title: item.title,
              tabBarAccessibilityLabel: item.title,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? item.activeIcon : item.icon}
                  size={tabIconSize}
                  color={color}
                />
              ),
            }}
            listeners={
              item.name === 'invoices'
                ? {
                    // Keep the Invoices tab on the list root (search + filters),
                    // not a previously opened invoice detail inside the stack.
                    tabPress: () => {
                      router.navigate(ROUTES.invoices);
                    },
                  }
                : undefined
            }
          />
        ) : (
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
        ),
      )}
    </Tabs>
  );
}

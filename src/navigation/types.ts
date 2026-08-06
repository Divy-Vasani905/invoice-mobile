import type { NativeStackNavigationOptions } from 'expo-router';
import type { BottomTabNavigationOptions } from 'expo-router/js-tabs';

/** Options accepted by every `Stack` / `Stack.Screen` in the app. */
export type StackScreenOptions = NativeStackNavigationOptions;

/** Options accepted by `Tabs` / `Tabs.Screen`. */
export type TabScreenOptions = BottomTabNavigationOptions;

/** Presentation styles used by the app's modal routes. */
export type ModalPresentation = Extract<
  NonNullable<StackScreenOptions['presentation']>,
  'modal' | 'formSheet' | 'fullScreenModal' | 'transparentModal'
>;

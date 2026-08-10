import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { type PropsWithChildren, useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastHost } from '@/components/feedback/Toast';
import { createNavigationTheme } from '@/navigation/config/navigation-theme';
import { HEADERLESS_SCREEN_OPTIONS, createHeaderOptions } from '@/navigation/config/screen-options';
import { ROUTE_NAMES } from '@/navigation/constants/routes';
import { useNavigationGuards } from '@/navigation/guards/use-navigation-guards';
import { useScreenAnalytics } from '@/navigation/hooks/use-screen-analytics';
import { useStackScreenOptions } from '@/navigation/hooks/use-screen-options';
import { queryClient } from '@/providers/query-client';
import { initializeProductionServices } from '@/services/bootstrap';
import { cStyle, ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    void initializeProductionServices();
  }, []);

  return (
    <GestureHandlerRootView style={cStyle.flex1}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            <KeyboardProvider>
              <NavigationChrome>
                <RootNavigator />
              </NavigationChrome>
            </KeyboardProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

/** Feeds the design system theme into React Navigation and the status bar. */
function NavigationChrome({ children }: PropsWithChildren) {
  const { theme, isDark } = useTheme();
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);
  useScreenAnalytics();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
      <ToastHost />
    </NavigationThemeProvider>
  );
}

/**
 * Root stack. It only arbitrates between the public flow and the main
 * application; every other route lives inside one of those two groups.
 */
function RootNavigator() {
  const { isBootstrapping, isAuthenticated } = useNavigationGuards();
  const screenOptions = useStackScreenOptions(HEADERLESS_SCREEN_OPTIONS);

  useEffect(() => {
    if (!isBootstrapping) {
      void SplashScreen.hideAsync();
    }
  }, [isBootstrapping]);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name={ROUTE_NAMES.public} />

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name={ROUTE_NAMES.protected} />
      </Stack.Protected>

      <Stack.Screen
        name={ROUTE_NAMES.notFound}
        options={createHeaderOptions({ title: 'Not Found' })}
      />
    </Stack>
  );
}

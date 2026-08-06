import { Redirect } from 'expo-router';

import { ScreenPlaceholder } from '@/navigation/components/screen-placeholder';
import { ROUTES } from '@/navigation/constants/routes';
import { useNavigationGuards } from '@/navigation/guards/use-navigation-guards';

/**
 * Entry route. It holds the app while startup work runs, then hands off to
 * onboarding on a first launch or straight to the dashboard afterwards.
 */
export default function SplashRoute() {
  const { isBootstrapping, hasCompletedOnboarding } = useNavigationGuards();

  if (!isBootstrapping) {
    return <Redirect href={hasCompletedOnboarding ? ROUTES.dashboard : ROUTES.onboarding} />;
  }

  return <ScreenPlaceholder name="Splash" />;
}

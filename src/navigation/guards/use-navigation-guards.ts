/**
 * Navigation guards decide which route groups exist for the current user.
 *
 * They are intentionally free of business logic: each flag is a seam that the
 * onboarding, auth and billing features will fill in later. `Stack.Protected`
 * consumes them so a screen becoming unavailable also drops its history.
 */
export type NavigationGuards = {
  /** Startup work is still running; keep the native splash screen up. */
  isBootstrapping: boolean;
  /** First-run onboarding has been finished at least once. */
  hasCompletedOnboarding: boolean;
  /** A user session exists. No auth provider is wired yet. */
  isAuthenticated: boolean;
  /** An active subscription entitles the user to premium-only routes. */
  isPremium: boolean;
};

/**
 * Placeholder guard state.
 *
 * TODO(onboarding): read `hasCompletedOnboarding` from persisted storage.
 * TODO(auth): derive `isAuthenticated` from the session provider.
 * TODO(billing): derive `isPremium` from the entitlement store.
 */
const NAVIGATION_GUARD_DEFAULTS: NavigationGuards = {
  isBootstrapping: false,
  hasCompletedOnboarding: true,
  isAuthenticated: true,
  isPremium: false,
};

export function useNavigationGuards(): NavigationGuards {
  return NAVIGATION_GUARD_DEFAULTS;
}

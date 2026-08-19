/**
 * Local-only user preferences from first-launch onboarding.
 * Independent from Firebase Remote Config.
 */
export type UserPreferences = {
  onboardingCompleted: boolean;
  countryCode: string | null;
  currencyCode: string | null;
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  onboardingCompleted: false,
  countryCode: null,
  currencyCode: null,
};

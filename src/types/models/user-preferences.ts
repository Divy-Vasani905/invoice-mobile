/**
 * Local-only user preferences from first-launch onboarding.
 * Independent from Firebase Remote Config.
 *
 * Notification OS permission is not stored here — it belongs to the system.
 */
export type UserPreferences = {
  onboardingCompleted: boolean;
  countryCode: string | null;
  currencyCode: string | null;
  autoBackupReminderEnabled: boolean;
  autoBackupReminderIntroShown: boolean;
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  onboardingCompleted: false,
  countryCode: null,
  currencyCode: null,
  autoBackupReminderEnabled: false,
  autoBackupReminderIntroShown: false,
};

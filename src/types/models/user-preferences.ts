/**
 * Local-only user preferences from first-launch onboarding.
 * Independent from Firebase Remote Config.
 *
 * Notification OS permission is not stored here — it belongs to the system.
 */
export type PaymentReminderType =
  '7_DAYS_BEFORE' | '2_DAYS_BEFORE' | 'DUE_DATE' | '1_DAY_AFTER' | '3_DAYS_AFTER' | '7_DAYS_AFTER';

export type PaymentReminderSettings = {
  enabled: boolean;
  enabledTypes: Record<PaymentReminderType, boolean>;
};

export const DEFAULT_PAYMENT_REMINDER_SETTINGS: PaymentReminderSettings = {
  enabled: true,
  enabledTypes: {
    '7_DAYS_BEFORE': true,
    '2_DAYS_BEFORE': true,
    DUE_DATE: true,
    '1_DAY_AFTER': true,
    '3_DAYS_AFTER': false,
    '7_DAYS_AFTER': false,
  },
};

export type UserPreferences = {
  onboardingCompleted: boolean;
  countryCode: string | null;
  currencyCode: string | null;
  autoBackupReminderEnabled: boolean;
  autoBackupReminderIntroShown: boolean;
  paymentReminderSettings: PaymentReminderSettings;
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  onboardingCompleted: false,
  countryCode: null,
  currencyCode: null,
  autoBackupReminderEnabled: false,
  autoBackupReminderIntroShown: false,
  paymentReminderSettings: DEFAULT_PAYMENT_REMINDER_SETTINGS,
};

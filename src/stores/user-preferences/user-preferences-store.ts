import { create } from 'zustand';

import { isValidCountryCode, isValidCurrencyCode } from '@/features/preferences/catalog';
import {
  businessRepository,
  customerRepository,
  invoiceRepository,
  productRepository,
  userPreferencesRepository,
} from '@/storage';
import {
  DEFAULT_PAYMENT_REMINDER_SETTINGS,
  DEFAULT_USER_PREFERENCES,
  type PaymentReminderSettings,
  type PaymentReminderType,
  type UserPreferences,
} from '@/types/models/user-preferences';

export type UserPreferencesState = UserPreferences & {
  isHydrated: boolean;
  completeOnboarding: (countryCode: string, currencyCode: string) => void;
  setCountryCode: (countryCode: string) => void;
  setCurrencyCode: (currencyCode: string) => void;
  setAutoBackupReminderEnabled: (enabled: boolean) => void;
  markAutoBackupReminderIntroShown: () => void;
  setPaymentReminderEnabled: (enabled: boolean) => void;
  setPaymentReminderTypeEnabled: (type: PaymentReminderType, enabled: boolean) => void;
  resetOnboarding: () => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object';
}

function normalizePaymentReminderSettings(stored: unknown): PaymentReminderSettings {
  if (!isRecord(stored)) return DEFAULT_PAYMENT_REMINDER_SETTINGS;
  const enabled = stored.enabled === true;
  const storedTypes = isRecord(stored.enabledTypes) ? stored.enabledTypes : {};
  const defaults = DEFAULT_PAYMENT_REMINDER_SETTINGS.enabledTypes;

  return {
    enabled,
    enabledTypes: {
      '7_DAYS_BEFORE':
        typeof storedTypes['7_DAYS_BEFORE'] === 'boolean'
          ? storedTypes['7_DAYS_BEFORE']
          : defaults['7_DAYS_BEFORE'],
      '2_DAYS_BEFORE':
        typeof storedTypes['2_DAYS_BEFORE'] === 'boolean'
          ? storedTypes['2_DAYS_BEFORE']
          : defaults['2_DAYS_BEFORE'],
      DUE_DATE:
        typeof storedTypes.DUE_DATE === 'boolean' ? storedTypes.DUE_DATE : defaults.DUE_DATE,
      '1_DAY_AFTER':
        typeof storedTypes['1_DAY_AFTER'] === 'boolean'
          ? storedTypes['1_DAY_AFTER']
          : defaults['1_DAY_AFTER'],
      '3_DAYS_AFTER':
        typeof storedTypes['3_DAYS_AFTER'] === 'boolean'
          ? storedTypes['3_DAYS_AFTER']
          : defaults['3_DAYS_AFTER'],
      '7_DAYS_AFTER':
        typeof storedTypes['7_DAYS_AFTER'] === 'boolean'
          ? storedTypes['7_DAYS_AFTER']
          : defaults['7_DAYS_AFTER'],
    },
  };
}

function normalizePreferences(stored: UserPreferences | Record<string, unknown> | null): {
  preferences: UserPreferences;
  shouldPersist: boolean;
} {
  if (stored == null || !isRecord(stored)) {
    return { preferences: { ...DEFAULT_USER_PREFERENCES }, shouldPersist: false };
  }

  const hasIntroKey = Object.prototype.hasOwnProperty.call(stored, 'autoBackupReminderIntroShown');
  const isExistingOnboardedUser = stored.onboardingCompleted === true && !hasIntroKey;

  const countryCode =
    typeof stored.countryCode === 'string' && stored.countryCode.length > 0
      ? stored.countryCode
      : null;
  const currencyCode =
    typeof stored.currencyCode === 'string' && stored.currencyCode.length > 0
      ? stored.currencyCode
      : null;

  return {
    preferences: {
      onboardingCompleted: stored.onboardingCompleted === true,
      countryCode,
      currencyCode,
      autoBackupReminderEnabled: stored.autoBackupReminderEnabled === true,
      autoBackupReminderIntroShown:
        stored.autoBackupReminderIntroShown === true || isExistingOnboardedUser,
      paymentReminderSettings: normalizePaymentReminderSettings(stored.paymentReminderSettings),
    },
    shouldPersist:
      !hasIntroKey ||
      !Object.prototype.hasOwnProperty.call(stored, 'autoBackupReminderEnabled') ||
      !Object.prototype.hasOwnProperty.call(stored, 'paymentReminderSettings'),
  };
}

function readPersistedPreferences(): UserPreferences {
  try {
    const stored = userPreferencesRepository.get();
    const { preferences, shouldPersist } = normalizePreferences(stored);
    if (shouldPersist) {
      persist(preferences);
    }
    return preferences;
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

function persist(preferences: UserPreferences): void {
  userPreferencesRepository.update(preferences);
}

function withCurrent(
  get: () => UserPreferencesState,
  patch: Partial<UserPreferences>,
): UserPreferences {
  const current = get();
  return {
    onboardingCompleted: patch.onboardingCompleted ?? current.onboardingCompleted,
    countryCode: patch.countryCode !== undefined ? patch.countryCode : current.countryCode,
    currencyCode: patch.currencyCode !== undefined ? patch.currencyCode : current.currencyCode,
    autoBackupReminderEnabled: patch.autoBackupReminderEnabled ?? current.autoBackupReminderEnabled,
    autoBackupReminderIntroShown:
      patch.autoBackupReminderIntroShown ?? current.autoBackupReminderIntroShown,
    paymentReminderSettings: patch.paymentReminderSettings ?? current.paymentReminderSettings,
  };
}

function syncBusinessCurrency(currencyCode: string): void {
  const business = businessRepository.get();
  if (business == null) return;
  if (business.defaultCurrencyCode === currencyCode) return;
  businessRepository.update({
    ...business,
    defaultCurrencyCode: currencyCode,
    updatedAt: new Date().toISOString(),
  });
}

const initial = readPersistedPreferences();

/**
 * Local user onboarding/preferences. Hydrated from MMKV, never from Remote Config.
 */
export const useUserPreferencesStore = create<UserPreferencesState>((set, get) => ({
  ...initial,
  isHydrated: true,

  completeOnboarding: (countryCode, currencyCode) => {
    const nextCountry = countryCode.trim().toUpperCase();
    const nextCurrency = currencyCode.trim().toUpperCase();
    if (!isValidCountryCode(nextCountry) || !isValidCurrencyCode(nextCurrency)) {
      throw new Error('Invalid country or currency.');
    }

    const next = withCurrent(get, {
      onboardingCompleted: true,
      countryCode: nextCountry,
      currencyCode: nextCurrency,
      autoBackupReminderEnabled: false,
      autoBackupReminderIntroShown: false,
    });
    persist(next);
    try {
      syncBusinessCurrency(nextCurrency);
    } catch {
      // Preference save already succeeded; business sync is best-effort.
    }
    set(next);
  },

  setCountryCode: (countryCode) => {
    const nextCountry = countryCode.trim().toUpperCase();
    if (!isValidCountryCode(nextCountry)) {
      throw new Error('Invalid country.');
    }
    const next = withCurrent(get, { countryCode: nextCountry });
    persist(next);
    set({ countryCode: nextCountry });
  },

  setCurrencyCode: (currencyCode) => {
    const nextCurrency = currencyCode.trim().toUpperCase();
    if (!isValidCurrencyCode(nextCurrency)) {
      throw new Error('Invalid currency.');
    }
    const next = withCurrent(get, { currencyCode: nextCurrency });
    persist(next);
    try {
      syncBusinessCurrency(nextCurrency);
    } catch {
      // Preference save already succeeded; business sync is best-effort.
    }
    set({ currencyCode: nextCurrency });
  },

  setAutoBackupReminderEnabled: (enabled) => {
    const next = withCurrent(get, { autoBackupReminderEnabled: enabled });
    persist(next);
    set({ autoBackupReminderEnabled: enabled });
  },

  markAutoBackupReminderIntroShown: () => {
    const next = withCurrent(get, { autoBackupReminderIntroShown: true });
    persist(next);
    set({ autoBackupReminderIntroShown: true });
  },

  setPaymentReminderEnabled: (enabled) => {
    const current = get().paymentReminderSettings;
    const paymentReminderSettings: PaymentReminderSettings = {
      ...current,
      enabled,
    };
    const next = withCurrent(get, { paymentReminderSettings });
    persist(next);
    set({ paymentReminderSettings });
  },

  setPaymentReminderTypeEnabled: (type, enabled) => {
    const current = get().paymentReminderSettings;
    const paymentReminderSettings: PaymentReminderSettings = {
      ...current,
      enabledTypes: {
        ...current.enabledTypes,
        [type]: enabled,
      },
    };
    const next = withCurrent(get, { paymentReminderSettings });
    persist(next);
    set({ paymentReminderSettings });
  },

  resetOnboarding: () => {
    customerRepository.clear();
    productRepository.clear();
    invoiceRepository.clear();
    businessRepository.delete();
    const next = { ...DEFAULT_USER_PREFERENCES };
    persist(next);
    set(next);
  },
}));

export function getPreferredCurrencyCode(): string {
  return (
    useUserPreferencesStore.getState().currencyCode ??
    businessRepository.get()?.defaultCurrencyCode ??
    'USD'
  );
}

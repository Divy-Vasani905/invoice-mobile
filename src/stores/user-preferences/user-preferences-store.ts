import { create } from 'zustand';

import { isValidCountryCode, isValidCurrencyCode } from '@/features/preferences/catalog';
import {
  businessRepository,
  customerRepository,
  invoiceRepository,
  productRepository,
  userPreferencesRepository,
} from '@/storage';
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/types/models/user-preferences';

export type UserPreferencesState = UserPreferences & {
  isHydrated: boolean;
  completeOnboarding: (countryCode: string, currencyCode: string) => void;
  setCountryCode: (countryCode: string) => void;
  setCurrencyCode: (currencyCode: string) => void;
  setAutoBackupReminderEnabled: (enabled: boolean) => void;
  markAutoBackupReminderIntroShown: () => void;
  resetOnboarding: () => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object';
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
    },
    shouldPersist:
      !hasIntroKey || !Object.prototype.hasOwnProperty.call(stored, 'autoBackupReminderEnabled'),
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

import { create } from 'zustand';

import { isValidCountryCode, isValidCurrencyCode } from '@/features/preferences/catalog';
import { businessRepository, userPreferencesRepository } from '@/storage';
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/types/models/user-preferences';

export type UserPreferencesState = UserPreferences & {
  isHydrated: boolean;
  completeOnboarding: (countryCode: string, currencyCode: string) => void;
  setCountryCode: (countryCode: string) => void;
  setCurrencyCode: (currencyCode: string) => void;
  resetOnboarding: () => void;
};

function readPersistedPreferences(): UserPreferences {
  try {
    const stored = userPreferencesRepository.get();
    if (stored == null) return { ...DEFAULT_USER_PREFERENCES };

    return {
      onboardingCompleted: stored.onboardingCompleted === true,
      countryCode:
        typeof stored.countryCode === 'string' && stored.countryCode.length > 0
          ? stored.countryCode
          : null,
      currencyCode:
        typeof stored.currencyCode === 'string' && stored.currencyCode.length > 0
          ? stored.currencyCode
          : null,
    };
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

function persist(preferences: UserPreferences): void {
  userPreferencesRepository.update(preferences);
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

    const next: UserPreferences = {
      onboardingCompleted: true,
      countryCode: nextCountry,
      currencyCode: nextCurrency,
    };
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
    const next: UserPreferences = {
      onboardingCompleted: get().onboardingCompleted,
      countryCode: nextCountry,
      currencyCode: get().currencyCode,
    };
    persist(next);
    set({ countryCode: nextCountry });
  },

  setCurrencyCode: (currencyCode) => {
    const nextCurrency = currencyCode.trim().toUpperCase();
    if (!isValidCurrencyCode(nextCurrency)) {
      throw new Error('Invalid currency.');
    }
    const next: UserPreferences = {
      onboardingCompleted: get().onboardingCompleted,
      countryCode: get().countryCode,
      currencyCode: nextCurrency,
    };
    persist(next);
    try {
      syncBusinessCurrency(nextCurrency);
    } catch {
      // Preference save already succeeded; business sync is best-effort.
    }
    set({ currencyCode: nextCurrency });
  },

  resetOnboarding: () => {
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

import { createMMKV } from 'react-native-mmkv';

import type { ThemePreference } from '@/theme/types';

const THEME_PREFERENCE_KEY = 'theme.preference';
const DEFAULT_PREFERENCE: ThemePreference = 'system';

const isThemePreference = (value: string | undefined): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

/**
 * Theme preference persistence via MMKV (already in the project).
 * Falls back to in-memory storage when native MMKV is unavailable (e.g. unsupported runtime).
 */
type PreferenceStore = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
};

let memoryStore: Record<string, string> = {};

const createFallbackStore = (): PreferenceStore => ({
  getString: (key) => memoryStore[key],
  set: (key, value) => {
    memoryStore = { ...memoryStore, [key]: value };
  },
});

const createStore = (): PreferenceStore => {
  try {
    return createMMKV({ id: 'invoice-theme' });
  } catch {
    return createFallbackStore();
  }
};

const store = createStore();

export function getStoredThemePreference(): ThemePreference {
  const value = store.getString(THEME_PREFERENCE_KEY);
  return isThemePreference(value) ? value : DEFAULT_PREFERENCE;
}

export function setStoredThemePreference(preference: ThemePreference): void {
  store.set(THEME_PREFERENCE_KEY, preference);
}

export function clearStoredThemePreference(): void {
  store.set(THEME_PREFERENCE_KEY, DEFAULT_PREFERENCE);
}

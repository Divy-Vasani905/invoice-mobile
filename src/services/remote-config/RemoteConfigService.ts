import { Platform } from 'react-native';

import {
  REMOTE_CONFIG_KEYS,
  REMOTE_CONFIG_MINIMUM_FETCH_INTERVAL_MS,
} from '@/services/remote-config/constants';
import type { GlobalConfig, MonetizationConfig } from '@/services/remote-config/types';
import {
  getDefaultGlobalConfig,
  getDefaultMonetizationConfig,
  parseAndValidateGlobalConfig,
  parseAndValidateMonetizationConfig,
  validateGlobalConfig,
  validateMonetizationConfig,
} from '@/services/remote-config/validation';
import { remoteConfigRepository } from '@/storage';
import { useRemoteConfigStore } from '@/stores/remote-config/remote-config-store';

let initializePromise: Promise<boolean> | null = null;
let hydrated = false;

function hydrateFromLocalCache(): void {
  if (hydrated) return;

  const validGlobal = validateGlobalConfig(remoteConfigRepository.getGlobalConfig());
  const validMonetization = validateMonetizationConfig(
    remoteConfigRepository.getMonetizationConfig(),
  );

  useRemoteConfigStore.getState().setHydratedConfig({
    globalConfig: validGlobal ?? getDefaultGlobalConfig(),
    monetizationConfig: validMonetization ?? getDefaultMonetizationConfig(),
  });

  hydrated = true;
}

function applyValidatedConfig(
  globalConfig: GlobalConfig,
  monetizationConfig: MonetizationConfig,
  fetchedAt: number | null,
): void {
  remoteConfigRepository.saveGlobalConfig(globalConfig);
  remoteConfigRepository.saveMonetizationConfig(monetizationConfig);

  if (fetchedAt != null) {
    useRemoteConfigStore.getState().setFetchedConfig({
      globalConfig,
      monetizationConfig,
      fetchedAt,
    });
    return;
  }

  useRemoteConfigStore.getState().setHydratedConfig({ globalConfig, monetizationConfig });
  useRemoteConfigStore.getState().markInitialized();
}

async function fetchAndApplyRemoteConfig(): Promise<void> {
  if (Platform.OS === 'web') {
    useRemoteConfigStore.getState().markInitialized();
    return;
  }

  const store = useRemoteConfigStore.getState();
  store.setFetching(true);

  try {
    const { fetchAndActivate, getRemoteConfig, getValue } =
      await import('@react-native-firebase/remote-config');

    const remoteConfig = getRemoteConfig();

    remoteConfig.settings = {
      minimumFetchIntervalMillis: REMOTE_CONFIG_MINIMUM_FETCH_INTERVAL_MS,
      fetchTimeoutMillis: 60_000,
    };

    remoteConfig.defaultConfig = {
      [REMOTE_CONFIG_KEYS.globalConfig]: JSON.stringify(getDefaultGlobalConfig()),
      [REMOTE_CONFIG_KEYS.monetizationConfig]: JSON.stringify(getDefaultMonetizationConfig()),
    };

    await fetchAndActivate(remoteConfig);

    const globalRaw = getValue(remoteConfig, REMOTE_CONFIG_KEYS.globalConfig).asString();
    const monetizationRaw = getValue(
      remoteConfig,
      REMOTE_CONFIG_KEYS.monetizationConfig,
    ).asString();

    const nextGlobal = parseAndValidateGlobalConfig(globalRaw);
    const nextMonetization = parseAndValidateMonetizationConfig(monetizationRaw);

    // Reject partial/invalid payloads — keep previous valid Zustand/MMKV values.
    if (nextGlobal == null || nextMonetization == null) {
      if (__DEV__) {
        console.warn('[remote-config] Invalid remote payload; keeping previous valid config.');
      }
      useRemoteConfigStore.getState().markInitialized();
      return;
    }

    applyValidatedConfig(nextGlobal, nextMonetization, Date.now());
  } catch (error) {
    if (__DEV__) {
      console.warn('[remote-config] fetch/activate failed; using local/defaults:', error);
    }
    useRemoteConfigStore.getState().markInitialized();
  } finally {
    useRemoteConfigStore.getState().setFetching(false);
  }
}

/**
 * Idempotent Remote Config bootstrap.
 * Hydrates Zustand from MMKV/defaults immediately, then fetches in the background.
 * Never throws; never blocks app usability on failure.
 */
export async function initializeRemoteConfig(): Promise<boolean> {
  hydrateFromLocalCache();
  useRemoteConfigStore.getState().markInitialized();

  if (initializePromise != null) {
    return initializePromise;
  }

  initializePromise = (async () => {
    await fetchAndApplyRemoteConfig();
    return true;
  })().catch((error: unknown) => {
    if (__DEV__) {
      console.warn('[remote-config] initialize failed:', error);
    }
    useRemoteConfigStore.getState().markInitialized();
    return false;
  });

  return initializePromise;
}

export function isRemoteConfigHydrated(): boolean {
  return hydrated;
}

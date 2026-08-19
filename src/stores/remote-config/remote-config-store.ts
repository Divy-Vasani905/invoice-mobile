import { create } from 'zustand';

import type { GlobalConfig, MonetizationConfig } from '@/services/remote-config/types';
import {
  getDefaultGlobalConfig,
  getDefaultMonetizationConfig,
  validateGlobalConfig,
  validateMonetizationConfig,
} from '@/services/remote-config/validation';
import { remoteConfigRepository } from '@/storage';

export type RemoteConfigState = {
  globalConfig: GlobalConfig;
  monetizationConfig: MonetizationConfig;
  isInitialized: boolean;
  isFetching: boolean;
  lastFetchedAt: number | null;
  setHydratedConfig: (payload: {
    globalConfig: GlobalConfig;
    monetizationConfig: MonetizationConfig;
  }) => void;
  setFetching: (isFetching: boolean) => void;
  setFetchedConfig: (payload: {
    globalConfig: GlobalConfig;
    monetizationConfig: MonetizationConfig;
    fetchedAt: number;
  }) => void;
  markInitialized: () => void;
};

function readPersistedRemoteConfig(): {
  globalConfig: GlobalConfig;
  monetizationConfig: MonetizationConfig;
} {
  const validGlobal = validateGlobalConfig(remoteConfigRepository.getGlobalConfig());
  const validMonetization = validateMonetizationConfig(
    remoteConfigRepository.getMonetizationConfig(),
  );

  return {
    globalConfig: validGlobal ?? getDefaultGlobalConfig(),
    monetizationConfig: validMonetization ?? getDefaultMonetizationConfig(),
  };
}

/**
 * Runtime source of truth for Remote Config.
 * Hydrated from MMKV/defaults first; updated after successful Firebase fetch+validate.
 */
const persisted = readPersistedRemoteConfig();

export const useRemoteConfigStore = create<RemoteConfigState>((set) => ({
  globalConfig: persisted.globalConfig,
  monetizationConfig: persisted.monetizationConfig,
  isInitialized: false,
  isFetching: false,
  lastFetchedAt: null,

  setHydratedConfig: ({ globalConfig, monetizationConfig }) =>
    set({ globalConfig, monetizationConfig }),

  setFetching: (isFetching) => set({ isFetching }),

  setFetchedConfig: ({ globalConfig, monetizationConfig, fetchedAt }) =>
    set({
      globalConfig,
      monetizationConfig,
      lastFetchedAt: fetchedAt,
      isFetching: false,
      isInitialized: true,
    }),

  markInitialized: () => set({ isInitialized: true, isFetching: false }),
}));

export function getGlobalConfig(): GlobalConfig {
  return useRemoteConfigStore.getState().globalConfig;
}

export function getMonetizationConfig(): MonetizationConfig {
  return useRemoteConfigStore.getState().monetizationConfig;
}

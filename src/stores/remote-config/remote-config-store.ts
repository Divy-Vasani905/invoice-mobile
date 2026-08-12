import { create } from 'zustand';

import type { GlobalConfig, MonetizationConfig } from '@/services/remote-config/types';
import {
  getDefaultGlobalConfig,
  getDefaultMonetizationConfig,
} from '@/services/remote-config/validation';

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

/**
 * Runtime source of truth for Remote Config.
 * Hydrated from MMKV/defaults first; updated after successful Firebase fetch+validate.
 */
export const useRemoteConfigStore = create<RemoteConfigState>((set) => ({
  globalConfig: getDefaultGlobalConfig(),
  monetizationConfig: getDefaultMonetizationConfig(),
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

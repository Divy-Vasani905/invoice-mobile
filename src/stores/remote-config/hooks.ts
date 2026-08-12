import type { GlobalConfig, MonetizationConfig } from '@/services/remote-config/types';
import { useRemoteConfigStore } from '@/stores/remote-config/remote-config-store';

export function useGlobalConfig(): GlobalConfig {
  return useRemoteConfigStore((s) => s.globalConfig);
}

export function useMonetizationConfig(): MonetizationConfig {
  return useRemoteConfigStore((s) => s.monetizationConfig);
}

export function useRemoteConfigStatus() {
  return useRemoteConfigStore((s) => ({
    isInitialized: s.isInitialized,
    isFetching: s.isFetching,
    lastFetchedAt: s.lastFetchedAt,
  }));
}

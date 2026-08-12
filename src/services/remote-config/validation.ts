import { z } from 'zod';

import {
  DEFAULT_GLOBAL_CONFIG,
  DEFAULT_MONETIZATION_CONFIG,
} from '@/services/remote-config/constants';
import type { GlobalConfig, MonetizationConfig } from '@/services/remote-config/types';

const globalConfigSchema = z.object({
  forceUpdate: z.boolean(),
  allowAppUsage: z.boolean(),
});

const monetizationConfigSchema = z.object({
  adsEnabled: z.boolean(),
  interstitialEnabled: z.boolean(),
  rewardedEnabled: z.boolean(),
  interstitialFrequency: z.number().int().min(1),
  rewardedDailyLimit: z.number().int().min(0),
  freeInvoicesPerMonth: z.number().int().min(0),
  rewardedInvoiceCredit: z.number().int().min(1),
  premiumRemovesAds: z.boolean(),
  allowRewardedOffline: z.boolean(),
  allowInvoiceGenerationWithoutInternet: z.boolean(),
  showAdsForPremiumUsers: z.boolean(),
});

function parseJsonObject(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function validateGlobalConfig(value: unknown): GlobalConfig | null {
  const result = globalConfigSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function validateMonetizationConfig(value: unknown): MonetizationConfig | null {
  const result = monetizationConfigSchema.safeParse(value);
  return result.success ? result.data : null;
}

/**
 * Validates a Remote Config global_config JSON payload.
 * Returns null when malformed or invalid — caller must keep previous config.
 */
export function parseAndValidateGlobalConfig(raw: string): GlobalConfig | null {
  return validateGlobalConfig(parseJsonObject(raw));
}

/**
 * Validates a Remote Config monetization_config JSON payload.
 * Returns null when malformed or invalid — caller must keep previous config.
 */
export function parseAndValidateMonetizationConfig(raw: string): MonetizationConfig | null {
  return validateMonetizationConfig(parseJsonObject(raw));
}

export function getDefaultGlobalConfig(): GlobalConfig {
  return { ...DEFAULT_GLOBAL_CONFIG };
}

export function getDefaultMonetizationConfig(): MonetizationConfig {
  return { ...DEFAULT_MONETIZATION_CONFIG };
}

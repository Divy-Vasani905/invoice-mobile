import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

import { getAppVersion } from '@/features/settings/utils/app-version';
import { APP_UPDATE_DISMISS_TTL_MS } from '@/services/remote-config/constants';
import { remoteConfigRepository } from '@/storage';
import { getGlobalConfig } from '@/stores/remote-config/remote-config-store';

export type AppUpdateCheckResult = {
  currentVersion: string;
  latestVersion: string | null;
  isUpdateAvailable: boolean;
  forceUpdate: boolean;
  storeUrl: string | null;
};

function getAndroidPackageName(): string {
  return Constants.expoConfig?.android?.package ?? 'com.divyvasani.easyinvoicemaker';
}

function getIosBundleId(): string {
  return Constants.expoConfig?.ios?.bundleIdentifier ?? 'com.divyvasani.easyinvoicemaker';
}

/** Semantic version compare: returns >0 if a>b, <0 if a<b, 0 if equal. */
export function compareVersions(a: string, b: string): number {
  const normalize = (value: string) =>
    value
      .trim()
      .replace(/^v/i, '')
      .split(/[.+-]/)
      .filter(Boolean)
      .map((part) => {
        const n = Number.parseInt(part, 10);
        return Number.isFinite(n) ? n : 0;
      });

  const left = normalize(a);
  const right = normalize(b);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function getCurrentAppVersion(): string {
  return getAppVersion();
}

function getPlayStoreUrl(packageName: string): string {
  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}`;
}

async function fetchLatestAndroidVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}&hl=en`,
      { headers: { 'Accept-Language': 'en-US' } },
    );
    if (!response.ok) return null;
    const html = await response.text();
    const patterns = [
      /\[\[\["([\d.]+)"\]\]/,
      /Current Version<\/div><span[^>]*><span[^>]*>([\d.]+)/i,
      /\[\[\[["']([\d.]+)["']\]/,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchLatestIosVersion(
  bundleId: string,
): Promise<{ version: string; trackViewUrl: string } | null> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}`,
    );
    if (!response.ok) return null;
    const json = (await response.json()) as {
      resultCount?: number;
      results?: { version?: string; trackViewUrl?: string }[];
    };
    const result = json.results?.[0];
    if (result?.version == null) return null;
    return {
      version: result.version,
      trackViewUrl: result.trackViewUrl ?? `https://apps.apple.com/app/id`,
    };
  } catch {
    return null;
  }
}

export async function getLatestStoreVersion(): Promise<{
  version: string | null;
  storeUrl: string | null;
}> {
  if (Platform.OS === 'android') {
    const packageName = getAndroidPackageName();
    const version = await fetchLatestAndroidVersion(packageName);
    return { version, storeUrl: getPlayStoreUrl(packageName) };
  }

  if (Platform.OS === 'ios') {
    const lookup = await fetchLatestIosVersion(getIosBundleId());
    return {
      version: lookup?.version ?? null,
      storeUrl: lookup?.trackViewUrl ?? null,
    };
  }

  return { version: null, storeUrl: null };
}

export function isUpdateAvailable(currentVersion: string, latestVersion: string | null): boolean {
  if (latestVersion == null || latestVersion.length === 0) return false;
  return compareVersions(latestVersion, currentVersion) > 0;
}

export function shouldSuppressOptionalUpdatePrompt(now = Date.now()): boolean {
  const dismissedAt = remoteConfigRepository.getUpdateDismissedAt();
  if (dismissedAt == null) return false;
  return now - dismissedAt < APP_UPDATE_DISMISS_TTL_MS;
}

export function dismissOptionalUpdatePrompt(now = Date.now()): void {
  remoteConfigRepository.saveUpdateDismissedAt(now);
}

export async function openStoreListing(storeUrl: string | null): Promise<void> {
  if (storeUrl == null) return;
  const canOpen = await Linking.canOpenURL(storeUrl);
  if (canOpen) {
    await Linking.openURL(storeUrl);
    return;
  }
  await Linking.openURL(storeUrl);
}

/**
 * Compares installed app version to the store listing.
 * Does not use Firebase Remote Config for latestVersion.
 */
export async function checkForAppUpdate(): Promise<AppUpdateCheckResult> {
  const currentVersion = getCurrentAppVersion();
  const { version: latestVersion, storeUrl } = await getLatestStoreVersion();
  const forceUpdate = getGlobalConfig().forceUpdate === true;

  return {
    currentVersion,
    latestVersion,
    isUpdateAvailable: isUpdateAvailable(currentVersion, latestVersion),
    forceUpdate,
    storeUrl,
  };
}

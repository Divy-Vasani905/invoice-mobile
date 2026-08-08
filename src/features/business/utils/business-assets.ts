import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

import type { BusinessAssetKind } from '../types/business.types';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function getBusinessAssetsDirectory(): string {
  if (documentDirectory == null) {
    throw new Error('Local document storage is unavailable on this platform.');
  }
  return `${documentDirectory}business-assets/`;
}

async function ensureBusinessAssetsDirectory(): Promise<string> {
  const directory = getBusinessAssetsDirectory();
  const info = await getInfoAsync(directory);
  if (!info.exists) {
    await makeDirectoryAsync(directory, { intermediates: true });
  }
  return directory;
}

function extensionFromUri(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(uri);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

/** Copies a picked image into durable app document storage and returns its URI. */
export async function persistBusinessAsset(
  sourceUri: string,
  kind: BusinessAssetKind,
): Promise<string> {
  const info = await getInfoAsync(sourceUri);
  if (!info.exists) {
    throw new Error('Selected image could not be found.');
  }
  if (info.size != null && info.size > MAX_IMAGE_BYTES) {
    throw new Error('Image must be 8 MB or smaller.');
  }

  const directory = await ensureBusinessAssetsDirectory();
  const destination = `${directory}${kind}-${Date.now()}.${extensionFromUri(sourceUri)}`;
  await copyAsync({ from: sourceUri, to: destination });
  return destination;
}

/** Best-effort cleanup for previously persisted business assets. */
export async function removeBusinessAsset(uri?: string | null): Promise<void> {
  if (uri == null || uri.length === 0) return;
  try {
    const directory = getBusinessAssetsDirectory();
    if (!uri.startsWith(directory)) return;
    await deleteAsync(uri, { idempotent: true });
  } catch {
    // Ignore cleanup failures so form flows remain resilient.
  }
}

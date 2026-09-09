import type { BusinessAssetKind } from '../types/business.types';

/**
 * Lightweight module-level store for passing the crop result from
 * CropBusinessImageScreen back to the original BusinessFormScreen.
 *
 * CropBusinessImageScreen writes the result, then calls `router.back()`.
 * BusinessFormScreen reads and clears the result when it regains focus.
 *
 * This avoids navigating forward to a new BusinessFormScreen instance
 * and keeps the navigation stack clean.
 */

export interface CropResult {
  uri: string;
  kind: BusinessAssetKind;
}

let pendingResult: CropResult | null = null;

/** Store a crop result so the original caller can retrieve it. */
export function setCropResult(result: CropResult): void {
  pendingResult = result;
}

/** Retrieve and clear the pending crop result. Returns `null` if none. */
export function consumeCropResult(): CropResult | null {
  const result = pendingResult;
  pendingResult = null;
  return result;
}

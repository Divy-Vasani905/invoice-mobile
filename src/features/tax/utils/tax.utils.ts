import type { SavedTaxRate, TaxCatalogSettings } from '@/types/models';
import { DEFAULT_TAX_CATALOG } from '@/types/models';

export const NO_TAX_SELECTION_ID = 'none';
export const SNAPSHOT_TAX_SELECTION_ID = 'snapshot';
export const MAX_TAX_NAME_LENGTH = 40;

export function resolveTaxCatalog(catalog?: TaxCatalogSettings | null): TaxCatalogSettings {
  if (catalog == null) return { ...DEFAULT_TAX_CATALOG, taxes: [] };
  return {
    enabled: catalog.enabled !== false,
    defaultTaxId: catalog.defaultTaxId,
    taxes: Array.isArray(catalog.taxes) ? catalog.taxes : [],
  };
}

export function normalizeTaxName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function taxDuplicateKey(name: string, rateBasisPoints: number): string {
  return `${normalizeTaxName(name).toLocaleLowerCase()}::${rateBasisPoints}`;
}

export function findDuplicateTax(
  taxes: SavedTaxRate[],
  name: string,
  rateBasisPoints: number,
  exceptId?: string,
): SavedTaxRate | undefined {
  const key = taxDuplicateKey(name, rateBasisPoints);
  return taxes.find(
    (tax) => tax.id !== exceptId && taxDuplicateKey(tax.name, tax.rateBasisPoints) === key,
  );
}

export function formatTaxPercent(rateBasisPoints: number): string {
  const percent = rateBasisPoints / 100;
  return Number.isInteger(percent) ? String(percent) : String(parseFloat(percent.toFixed(4)));
}

export function formatSavedTaxLabel(tax: { name: string; rateBasisPoints: number }): string {
  return `${tax.name} ${formatTaxPercent(tax.rateBasisPoints)}%`;
}

export function parseTaxPercentToBasisPoints(value: string): number | null {
  const normalized = value.trim().replace(/%/g, '').replace(/,/g, '');
  if (normalized.length === 0) return null;
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const rate = Number(normalized);
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) return null;
  return Math.round(rate * 100);
}

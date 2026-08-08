import { ProductType, ProductUnit, type Product } from '@/types/models';

import type { ProductFormValues } from '../types/product.types';

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: '',
  description: '',
  type: ProductType.Service,
  sku: '',
  unit: ProductUnit.Each,
  unitPrice: '',
  taxRate: '',
  currencyCode: 'USD',
  isActive: true,
};

export const PRODUCT_TYPE_OPTIONS = [
  { value: ProductType.Good, label: 'Product' },
  { value: ProductType.Service, label: 'Service' },
] as const;

export const PRODUCT_UNIT_OPTIONS = [
  { value: ProductUnit.Each, label: 'Unit' },
  { value: ProductUnit.Piece, label: 'Piece' },
  { value: ProductUnit.Hour, label: 'Hour' },
  { value: ProductUnit.Day, label: 'Day' },
  { value: ProductUnit.Week, label: 'Week' },
  { value: ProductUnit.Month, label: 'Month' },
  { value: ProductUnit.Project, label: 'Project' },
  { value: ProductUnit.Kilogram, label: 'Kg' },
  { value: ProductUnit.Gram, label: 'Gram' },
  { value: ProductUnit.Litre, label: 'Litre' },
  { value: ProductUnit.Metre, label: 'Metre' },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'AUD', label: 'AUD' },
  { value: 'CAD', label: 'CAD' },
] as const;

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function compactOptional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function getCurrencyFractionDigits(currencyCode: string): number {
  return (
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
}

export function toMajorUnits(amountMinor: number, currencyCode: string): number {
  return amountMinor / 10 ** getCurrencyFractionDigits(currencyCode);
}

export function toMinorUnits(amountMajor: number, currencyCode: string): number {
  return Math.round(amountMajor * 10 ** getCurrencyFractionDigits(currencyCode));
}

export function formatMoney(amountMinor: number, currencyCode: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(toMajorUnits(amountMinor, currencyCode));
}

export function getProductTypeLabel(type: ProductType): string {
  return type === ProductType.Service ? 'Service' : 'Product';
}

export function getProductUnitLabel(unit: ProductUnit): string {
  return PRODUCT_UNIT_OPTIONS.find((option) => option.value === unit)?.label ?? unit;
}

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? '',
    type: product.type,
    sku: product.sku ?? '',
    unit: product.unit,
    unitPrice: String(toMajorUnits(product.unitPrice.amountMinor, product.unitPrice.currencyCode)),
    taxRate: product.taxRateBasisPoints === 0 ? '' : String(product.taxRateBasisPoints / 100),
    currencyCode: product.unitPrice.currencyCode,
    isActive: product.isActive,
  };
}

export function parsePriceInput(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '');
  if (normalized.length === 0) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

export function parseTaxRateInput(value: string): number | null {
  const normalized = value.trim();
  if (normalized.length === 0) return 0;
  const rate = Number(normalized);
  return Number.isFinite(rate) ? rate : null;
}

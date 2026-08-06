import type { Money, OfflineEntity } from '@/types/models/common';

export enum ProductType {
  Good = 'good',
  Service = 'service',
}

export enum ProductUnit {
  Each = 'each',
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Kilogram = 'kilogram',
  Gram = 'gram',
  Litre = 'litre',
  Metre = 'metre',
}

export interface Product extends OfflineEntity {
  businessId: string;
  name: string;
  description?: string;
  type: ProductType;
  unit: ProductUnit;
  unitPrice: Money;
  taxRateBasisPoints: number;
  sku?: string;
  isActive: boolean;
}

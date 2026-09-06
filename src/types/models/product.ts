import { DiscountType } from '@/services/invoice/calculation/types/invoice-calculation.types';
import type { Money, OfflineEntity } from '@/types/models/common';

export { DiscountType };

export enum ProductType {
  Good = 'good',
  Service = 'service',
}

export enum ProductUnit {
  Each = 'each',
  Piece = 'piece',
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Project = 'project',
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
  discountType?: DiscountType;
  discount?: number;
  taxRateBasisPoints: number;
  sku?: string;
  isActive: boolean;
}

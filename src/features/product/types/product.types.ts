import type { Product, ProductType, ProductUnit } from '@/types/models';

export interface ProductFormValues {
  name: string;
  description: string;
  type: ProductType;
  sku: string;
  unit: ProductUnit;
  unitPrice: string;
  taxRate: string;
  currencyCode: string;
  isActive: boolean;
}

export interface ProductListItem {
  product: Product;
  formattedPrice: string;
  typeLabel: string;
  unitLabel: string;
}

export class ProductReferencedError extends Error {
  public constructor(public readonly referenceCount: number) {
    super(
      `This product or service is used on ${referenceCount} ${
        referenceCount === 1 ? 'invoice' : 'invoices'
      } and cannot be deleted. Deactivate it instead to keep historical invoices intact.`,
    );
    this.name = 'ProductReferencedError';
  }
}

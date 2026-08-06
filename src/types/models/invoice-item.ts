import type { Money, OfflineEntity } from '@/types/models/common';
import type { ProductUnit } from '@/types/models/product';

/**
 * Captures a product's sellable details at invoice creation time so historic
 * invoices are not changed by later product edits.
 */
export interface ProductSnapshot {
  productId?: string;
  name: string;
  description?: string;
  unit: ProductUnit;
  sku?: string;
}

export interface InvoiceItem extends OfflineEntity {
  invoiceId: string;
  position: number;
  product: ProductSnapshot;
  quantity: number;
  unitPrice: Money;
  discountAmount: Money;
  taxRateBasisPoints: number;
  subtotalAmount: Money;
  taxAmount: Money;
  totalAmount: Money;
}

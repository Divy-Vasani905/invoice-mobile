import {
  businessRepository,
  invoiceRepository,
  productRepository,
  settingsRepository,
  type InvoiceRepository,
  type ProductRepository as ProductStorageRepository,
} from '@/storage';
import { getPreferredCurrencyCode } from '@/stores/user-preferences';
import { ProductType, ProductUnit, SyncStatus, type Product } from '@/types/models';

import { ProductReferencedError } from '../types/product.types';
import {
  compactOptional,
  createLocalId,
  formatMoney,
  getProductTypeLabel,
  getProductUnitLabel,
  parsePriceInput,
  parseTaxRateInput,
  toMinorUnits,
} from '../utils/product.utils';

import type { ProductFormValues, ProductListItem } from '../types/product.types';

const LOCAL_BUSINESS_ID = 'local-business';
const RECENT_PRODUCT_LIMIT = 6;

/** Feature adapter over the existing MMKV product repository. */
export class ProductRepository {
  public constructor(
    private readonly products: ProductStorageRepository = productRepository,
    private readonly invoices: InvoiceRepository = invoiceRepository,
  ) {}

  public getProducts(): ProductListItem[] {
    return this.products
      .getAll()
      .filter((product) => product.syncStatus !== SyncStatus.Deleted)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(toListItem);
  }

  public getRecentProducts(limit = RECENT_PRODUCT_LIMIT): ProductListItem[] {
    return this.products
      .getAll()
      .filter((product) => product.syncStatus !== SyncStatus.Deleted)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, limit)
      .map(toListItem);
  }

  public getProductById(productId: string): Product | null {
    const product = this.products.getById(productId);
    if (product == null || product.syncStatus === SyncStatus.Deleted) return null;
    return product;
  }

  public createProduct(values: ProductFormValues): Product {
    const timestamp = new Date().toISOString();
    const product: Product = {
      ...toPersistedFields(values),
      id: createLocalId('product'),
      businessId: businessRepository.get()?.id ?? LOCAL_BUSINESS_ID,
      createdAt: timestamp,
      updatedAt: timestamp,
      localRevision: 1,
      syncStatus: SyncStatus.Pending,
    };
    this.products.create(product);
    return product;
  }

  public updateProduct(productId: string, values: ProductFormValues): Product {
    const current = this.requireProduct(productId);
    const product: Product = {
      ...current,
      ...toPersistedFields(values),
      updatedAt: new Date().toISOString(),
      localRevision: current.localRevision + 1,
      syncStatus: SyncStatus.Pending,
    };
    this.products.update(product);
    return product;
  }

  public deleteProduct(productId: string): void {
    this.requireProduct(productId);
    const referenceCount = this.countInvoiceReferences(productId);
    if (referenceCount > 0) throw new ProductReferencedError(referenceCount);
    this.products.delete(productId);
  }

  public deactivateProduct(productId: string): Product {
    const current = this.requireProduct(productId);
    const product: Product = {
      ...current,
      isActive: false,
      updatedAt: new Date().toISOString(),
      localRevision: current.localRevision + 1,
      syncStatus: SyncStatus.Pending,
    };
    this.products.update(product);
    return product;
  }

  public getDefaultFormValues(): ProductFormValues {
    const settings = settingsRepository.get();
    return {
      name: '',
      description: '',
      type: ProductType.Service,
      sku: '',
      unit: settings?.invoice.defaultProductUnit ?? ProductUnit.Each,
      unitPrice: '',
      taxRate: '',
      currencyCode: getPreferredCurrencyCode(),
      isActive: true,
    };
  }

  /** Counts invoices that snapshot this product on a line item. */
  private countInvoiceReferences(productId: string): number {
    return this.invoices.getAll().reduce((count, invoice) => {
      const items = Array.isArray(invoice.items) ? invoice.items : [];
      const referenced = items.some((item) => item.product?.productId === productId);
      return referenced ? count + 1 : count;
    }, 0);
  }

  private requireProduct(productId: string): Product {
    const product = this.getProductById(productId);
    if (product == null) throw new Error('Product not found.');
    return product;
  }
}

function toPersistedFields(values: ProductFormValues) {
  const price = parsePriceInput(values.unitPrice);
  const taxRate = parseTaxRateInput(values.taxRate);
  if (price == null || taxRate == null) {
    throw new Error('Invalid product pricing values.');
  }

  return {
    name: values.name.trim(),
    description: compactOptional(values.description),
    type: values.type,
    unit: values.unit,
    unitPrice: {
      amountMinor: toMinorUnits(price, values.currencyCode),
      currencyCode: values.currencyCode,
    },
    taxRateBasisPoints: Math.round(taxRate * 100),
    sku: compactOptional(values.sku),
    isActive: values.isActive,
  };
}

function toListItem(product: Product): ProductListItem {
  return {
    product,
    formattedPrice: formatMoney(product.unitPrice.amountMinor, product.unitPrice.currencyCode),
    typeLabel: getProductTypeLabel(product.type),
    unitLabel: getProductUnitLabel(product.unit),
  };
}

export const productFeatureRepository = new ProductRepository();

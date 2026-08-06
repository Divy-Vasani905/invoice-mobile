import { StorageKeys } from '@/storage/keys';
import { storage } from '@/storage/mmkv';
import { MmkvBusinessRepository } from '@/storage/repositories/business-repository';
import { MmkvCustomerRepository } from '@/storage/repositories/customer-repository';
import { MmkvInvoiceRepository } from '@/storage/repositories/invoice-repository';
import { MmkvProductRepository } from '@/storage/repositories/product-repository';
import { MmkvSettingsRepository } from '@/storage/repositories/settings-repository';

export type { BusinessRepository } from '@/storage/interfaces/business-repository';
export type { CustomerRepository } from '@/storage/interfaces/customer-repository';
export type { InvoiceRepository } from '@/storage/interfaces/invoice-repository';
export type { ProductRepository } from '@/storage/interfaces/product-repository';
export type {
  CrudRepository,
  SingletonCrudRepository,
  SingletonRepository,
} from '@/storage/interfaces/repository';
export type { SettingsRepository } from '@/storage/interfaces/settings-repository';
export type { StorageDriver } from '@/storage/interfaces/storage-driver';

export { StorageKeys } from '@/storage/keys';
export { storage } from '@/storage/mmkv';

export {
  JsonRepository,
  JsonSingletonCrudRepository,
  JsonSingletonRepository,
} from '@/storage/repositories/json-repository';
export { MmkvBusinessRepository } from '@/storage/repositories/business-repository';
export { MmkvCustomerRepository } from '@/storage/repositories/customer-repository';
export { MmkvInvoiceRepository } from '@/storage/repositories/invoice-repository';
export { MmkvProductRepository } from '@/storage/repositories/product-repository';
export { MmkvSettingsRepository } from '@/storage/repositories/settings-repository';

/** Ready-to-use repository instances backed by the central MMKV store. */
export const businessRepository = new MmkvBusinessRepository(storage, StorageKeys.business);
export const customerRepository = new MmkvCustomerRepository(storage, StorageKeys.customers);
export const productRepository = new MmkvProductRepository(storage, StorageKeys.products);
export const invoiceRepository = new MmkvInvoiceRepository(storage, StorageKeys.invoices);
export const settingsRepository = new MmkvSettingsRepository(storage, StorageKeys.settings);

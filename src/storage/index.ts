import { StorageKeys } from '@/storage/keys';
import { storage } from '@/storage/mmkv';
import { MmkvAdMonetizationRepository } from '@/storage/repositories/ad-monetization-repository';
import { MmkvBusinessRepository } from '@/storage/repositories/business-repository';
import { MmkvCustomerRepository } from '@/storage/repositories/customer-repository';
import { MmkvInvoiceCreditRepository } from '@/storage/repositories/invoice-credit-repository';
import { MmkvInvoiceRepository } from '@/storage/repositories/invoice-repository';
import { MmkvProductRepository } from '@/storage/repositories/product-repository';
import { MmkvRemoteConfigRepository } from '@/storage/repositories/remote-config-repository';
import { MmkvSettingsRepository } from '@/storage/repositories/settings-repository';

export type { AdMonetizationRepository } from '@/storage/repositories/ad-monetization-repository';
export type { BusinessRepository } from '@/storage/interfaces/business-repository';
export type { CustomerRepository } from '@/storage/interfaces/customer-repository';
export type { InvoiceCreditRepository } from '@/storage/interfaces/invoice-credit-repository';
export type { InvoiceRepository } from '@/storage/interfaces/invoice-repository';
export type { ProductRepository } from '@/storage/interfaces/product-repository';
export type {
  CrudRepository,
  SingletonCrudRepository,
  SingletonRepository,
} from '@/storage/interfaces/repository';
export type { RemoteConfigRepository } from '@/storage/repositories/remote-config-repository';
export type { SettingsRepository } from '@/storage/interfaces/settings-repository';
export type { StorageDriver } from '@/storage/interfaces/storage-driver';

export { StorageKeys } from '@/storage/keys';
export { storage } from '@/storage/mmkv';

export {
  JsonRepository,
  JsonSingletonCrudRepository,
  JsonSingletonRepository,
} from '@/storage/repositories/json-repository';
export { MmkvAdMonetizationRepository } from '@/storage/repositories/ad-monetization-repository';
export { MmkvBusinessRepository } from '@/storage/repositories/business-repository';
export { MmkvCustomerRepository } from '@/storage/repositories/customer-repository';
export { MmkvInvoiceCreditRepository } from '@/storage/repositories/invoice-credit-repository';
export { MmkvInvoiceRepository } from '@/storage/repositories/invoice-repository';
export { MmkvProductRepository } from '@/storage/repositories/product-repository';
export { MmkvRemoteConfigRepository } from '@/storage/repositories/remote-config-repository';
export { MmkvSettingsRepository } from '@/storage/repositories/settings-repository';

/** Ready-to-use repository instances backed by the central MMKV store. */
export const businessRepository = new MmkvBusinessRepository(storage, StorageKeys.business);
export const customerRepository = new MmkvCustomerRepository(storage, StorageKeys.customers);
export const productRepository = new MmkvProductRepository(storage, StorageKeys.products);
export const invoiceRepository = new MmkvInvoiceRepository(storage, StorageKeys.invoices);
export const settingsRepository = new MmkvSettingsRepository(storage, StorageKeys.settings);
export const invoiceCreditRepository = new MmkvInvoiceCreditRepository(
  storage,
  StorageKeys.invoiceCredits,
);
export const adMonetizationRepository = new MmkvAdMonetizationRepository(
  storage,
  StorageKeys.adMonetization,
);
export const remoteConfigRepository = new MmkvRemoteConfigRepository(
  storage,
  StorageKeys.remoteConfigGlobal,
  StorageKeys.remoteConfigMonetization,
  StorageKeys.appUpdateDismissedAt,
);

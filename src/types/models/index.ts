export type {
  Address,
  EntityIdentity,
  EntityTimestamps,
  Money,
  OfflineEntity,
  SyncMetadata,
} from '@/types/models/common';
export { SyncStatus } from '@/types/models/common';

export type { Business } from '@/types/models/business';
export type { Customer } from '@/types/models/customer';

export type { Product } from '@/types/models/product';
export { ProductType, ProductUnit } from '@/types/models/product';

export type { InvoiceItem, ProductSnapshot } from '@/types/models/invoice-item';

export type {
  Invoice,
  InvoiceAppliedTax,
  InvoiceDocument,
  InvoicePartySnapshot,
  InvoiceTotals,
} from '@/types/models/invoice';
export { InvoiceStatus } from '@/types/models/invoice';

export type { Subscription } from '@/types/models/subscription';
export {
  SubscriptionPlan,
  SubscriptionProvider,
  SubscriptionStatus,
} from '@/types/models/subscription';

export type {
  InvoiceCreditBalance,
  InvoiceCreditEntitlement,
  InvoiceCreditPurchaseIntent,
  InvoiceCreditSnapshot,
  InvoiceCreditSource,
} from '@/types/models/invoice-credits';

export type {
  AppSettings,
  InvoiceSettings,
  SavedTaxRate,
  TaxCatalogSettings,
} from '@/types/models/app-settings';
export type { UserPreferences } from '@/types/models/user-preferences';
export { DEFAULT_USER_PREFERENCES } from '@/types/models/user-preferences';
export {
  DEFAULT_INVOICE_NUMBER_PADDING,
  DEFAULT_INVOICE_PREFIX,
  DEFAULT_NEXT_INVOICE_NUMBER,
  DEFAULT_TAX_CATALOG,
  InvoiceNumberingMode,
  MAX_INVOICE_NUMBER_PADDING,
  MIN_INVOICE_NUMBER_PADDING,
  ThemePreference,
} from '@/types/models/app-settings';

export type { Advertisement } from '@/types/models/advertisement';
export {
  AdvertisementFormat,
  AdvertisementPlacement,
  AdvertisementProvider,
} from '@/types/models/advertisement';

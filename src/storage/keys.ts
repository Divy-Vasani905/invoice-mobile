/**
 * Namespaced keys owned by the local repository layer.
 * Never reuse these keys outside their matching repository.
 */
export const StorageKeys = {
  business: 'entities.business',
  customers: 'entities.customers',
  products: 'entities.products',
  invoices: 'entities.invoices',
  settings: 'entities.settings',
  invoiceCredits: 'entities.invoiceCredits',
  adMonetization: 'entities.adMonetization',
  remoteConfigGlobal: 'remoteConfig.globalConfig',
  remoteConfigMonetization: 'remoteConfig.monetizationConfig',
  appUpdateDismissedAt: 'appUpdate.updateDismissedAt',
} as const;

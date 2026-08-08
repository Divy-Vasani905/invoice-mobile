import type { Href } from 'expo-router';

/**
 * Single source of truth for every navigable destination.
 *
 * Screens and features should link through `ROUTES` instead of writing path
 * literals, so route restructuring stays a one-file change.
 */
export const ROUTES = {
  // Public
  splash: '/' as Href,
  onboarding: '/onboarding' as Href,

  // Tabs
  dashboard: '/dashboard' as Href,
  invoices: '/invoices' as Href,
  customers: '/customers' as Href,
  settings: '/settings' as Href,

  // Invoices module
  invoiceDetails: (invoiceId: string): Href => `/invoices/${invoiceId}` as Href,

  // Customers module
  customerDetails: (customerId: string): Href => `/customers/${customerId}` as Href,

  // Products module (stack under dashboard — not a tab)
  products: '/dashboard/products' as Href,

  // Business / Settings module
  businessProfile: '/settings/business-profile' as Href,
  invoiceSettings: '/settings/invoice-settings' as Href,
  invoiceTemplates: '/settings/invoice-templates' as Href,
  invoiceNumberFormat: '/settings/invoice-number-format' as Href,
  currencySettings: '/settings/currency' as Href,
  taxSettings: '/settings/tax-settings' as Href,
  backupRestore: '/settings/backup-restore' as Href,
  helpCenter: '/settings/help-center' as Href,
  contactSupport: '/settings/contact-support' as Href,
  reportBug: '/settings/report-bug' as Href,
  featureRequest: '/settings/feature-request' as Href,
  privacyPolicy: '/settings/privacy-policy' as Href,
  termsOfService: '/settings/terms' as Href,

  // Premium module
  premium: '/premium' as Href,
  subscription: '/premium/subscription' as Href,
  restorePurchases: '/premium/restore-purchases' as Href,

  // Modals
  createInvoice: '/create-invoice' as Href,
  editInvoice: (invoiceId: string): Href => `/edit-invoice/${invoiceId}` as Href,
  invoicePreview: (invoiceId: string): Href => `/invoice-preview/${invoiceId}` as Href,
  createCustomer: '/create-customer' as Href,
  editCustomer: (customerId: string): Href => `/edit-customer/${customerId}` as Href,
  createProduct: '/create-product' as Href,
  editProduct: (productId: string): Href => `/edit-product/${productId}` as Href,
} as const;

/**
 * Route names as Expo Router resolves them relative to their nearest layout.
 * Group folders without a `_layout` stay part of the name, which is why the
 * modal entries are prefixed with `(modals)/`.
 */
export const ROUTE_NAMES = {
  public: '(public)',
  protected: '(protected)',
  tabs: '(tabs)',
  premium: 'premium',
  notFound: '+not-found',

  modals: {
    createInvoice: '(modals)/create-invoice',
    editInvoice: '(modals)/edit-invoice/[invoiceId]',
    invoicePreview: '(modals)/invoice-preview/[invoiceId]',
    createCustomer: '(modals)/create-customer',
    editCustomer: '(modals)/edit-customer/[customerId]',
    createProduct: '(modals)/create-product',
    editProduct: '(modals)/edit-product/[productId]',
  },
} as const;

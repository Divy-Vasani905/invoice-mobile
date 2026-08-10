/**
 * Canonical Analytics event names.
 * Keep this list small and free of PII parameters.
 */
export const AnalyticsEvents = {
  AppOpened: 'app_opened',
  DashboardViewed: 'dashboard_viewed',
  InvoiceCreated: 'invoice_created',
  InvoiceUpdated: 'invoice_updated',
  InvoiceDeleted: 'invoice_deleted',
  InvoiceShared: 'invoice_shared',
  CustomerCreated: 'customer_created',
  ProductCreated: 'product_created',
  BusinessProfileUpdated: 'business_profile_updated',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export type AnalyticsEventParams = Record<string, string | number | boolean>;

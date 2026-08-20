import { z } from 'zod';

import { isValidCountryCode, isValidCurrencyCode } from '@/features/preferences/catalog';
import {
  InvoiceNumberingMode,
  InvoiceStatus,
  MAX_INVOICE_NUMBER_PADDING,
  MIN_INVOICE_NUMBER_PADDING,
  ProductType,
  ProductUnit,
  SyncStatus,
} from '@/types/models';

import {
  BackupInvalidError,
  BackupUnsupportedVersionError,
  EASY_INVOICE_BACKUP_TYPE,
  EASY_INVOICE_BACKUP_VERSION,
  type EasyInvoiceBackup,
} from './types';

const syncStatusSchema = z.enum(SyncStatus);
const invoiceStatusSchema = z.enum(InvoiceStatus);
const invoiceNumberingModeSchema = z.enum(InvoiceNumberingMode);

const isoTimestampSchema = z.string().trim().min(1);

const moneySchema = z
  .object({
    amountMinor: z.number().int(),
    currencyCode: z.string().trim().min(1),
  })
  .passthrough();

const addressSchema = z
  .object({
    line1: z.string(),
    city: z.string(),
    countryCode: z.string(),
    line2: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .passthrough();

const offlineEntitySchema = z.object({
  id: z.string().trim().min(1),
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
  localRevision: z.number(),
  syncStatus: syncStatusSchema,
  remoteId: z.string().optional(),
  lastSyncedAt: z.string().optional(),
  deletedAt: z.string().optional(),
});

const businessSchema = offlineEntitySchema
  .extend({
    legalName: z.string().trim().min(1),
    displayName: z.string().trim().min(1),
    defaultCurrencyCode: z.string().trim().min(1),
    email: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    address: addressSchema.optional(),
    taxId: z.string().optional(),
    registrationNumber: z.string().optional(),
    logoUri: z.string().optional(),
    authorizedSignatureUri: z.string().optional(),
    defaultInvoiceNotes: z.string().optional(),
  })
  .passthrough();

const customerSchema = offlineEntitySchema
  .extend({
    businessId: z.string().trim().min(1),
    displayName: z.string().trim().min(1),
    companyName: z.string().optional(),
    contactName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    billingAddress: addressSchema.optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
  })
  .passthrough();

const productSchema = offlineEntitySchema
  .extend({
    businessId: z.string().trim().min(1),
    name: z.string().trim().min(1),
    type: z.enum(ProductType),
    unit: z.enum(ProductUnit),
    unitPrice: moneySchema,
    taxRateBasisPoints: z.number().int(),
    isActive: z.boolean(),
    description: z.string().optional(),
    sku: z.string().optional(),
  })
  .passthrough();

const invoicePartySchema = z
  .object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: addressSchema.optional(),
    taxId: z.string().optional(),
    logoUri: z.string().optional(),
    companyName: z.string().optional(),
  })
  .passthrough();

const invoiceItemSchema = offlineEntitySchema
  .extend({
    invoiceId: z.string().trim().min(1),
    position: z.number().int(),
    product: z
      .object({
        name: z.string().trim().min(1),
        unit: z.enum(ProductUnit),
        productId: z.string().optional(),
        description: z.string().optional(),
        sku: z.string().optional(),
      })
      .passthrough(),
    quantity: z.number(),
    unitPrice: moneySchema,
    discountAmount: moneySchema,
    taxRateBasisPoints: z.number().int(),
    subtotalAmount: moneySchema,
    taxAmount: moneySchema,
    totalAmount: moneySchema,
  })
  .passthrough();

const invoiceTotalsSchema = z
  .object({
    subtotalAmount: moneySchema,
    discountAmount: moneySchema,
    taxAmount: moneySchema,
    roundOffAmount: moneySchema,
    totalAmount: moneySchema,
    paidAmount: moneySchema,
    balanceAmount: moneySchema,
  })
  .passthrough();

const invoiceSchema = offlineEntitySchema
  .extend({
    businessId: z.string().trim().min(1),
    invoiceNumber: z.string().trim().min(1),
    status: invoiceStatusSchema,
    issuedAt: isoTimestampSchema,
    currencyCode: z.string().trim().min(1),
    business: invoicePartySchema,
    customer: invoicePartySchema,
    items: z.array(invoiceItemSchema),
    totals: invoiceTotalsSchema,
    customerId: z.string().optional(),
    dueAt: z.string().optional(),
    appliedTax: z
      .object({
        name: z.string(),
        rateBasisPoints: z.number().int(),
        amount: moneySchema,
        taxId: z.string().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
  })
  .passthrough()
  .transform((invoice) => {
    const { document: _document, ...record } = invoice;
    return record;
  });

const invoiceNumberFormatSchema = z
  .object({
    invoiceNumberingMode: invoiceNumberingModeSchema,
    invoiceNumberPrefix: z.string(),
    nextInvoiceNumber: z.number().int().positive(),
    invoiceNumberPadding: z
      .number()
      .int()
      .min(MIN_INVOICE_NUMBER_PADDING)
      .max(MAX_INVOICE_NUMBER_PADDING)
      .optional(),
  })
  .passthrough();

const currencySettingsSchema = z.object({
  currencyCode: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .refine(
      (value) => value == null || isValidCurrencyCode(value.toUpperCase()),
      'Invalid currency code',
    ),
});

const countrySettingsSchema = z.object({
  countryCode: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .refine(
      (value) => value == null || isValidCountryCode(value.toUpperCase()),
      'Invalid country code',
    ),
});

const savedTaxSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    rateBasisPoints: z.number().int(),
    createdAt: isoTimestampSchema,
    updatedAt: isoTimestampSchema,
  })
  .passthrough();

const taxSettingsSchema = z
  .object({
    enabled: z.boolean(),
    taxes: z.array(savedTaxSchema),
    defaultTaxId: z.string().optional(),
  })
  .passthrough();

function assertUniqueIds(ids: string[]): void {
  if (new Set(ids).size !== ids.length) {
    throw new BackupInvalidError();
  }
}

const backupDataSchema = z.object({
  businessProfile: businessSchema.nullable(),
  customers: z.array(customerSchema),
  products: z.array(productSchema).default([]),
  invoices: z.array(invoiceSchema),
  invoiceNumberFormat: invoiceNumberFormatSchema.nullable(),
  currencySettings: currencySettingsSchema,
  countrySettings: countrySettingsSchema.optional(),
  taxSettings: taxSettingsSchema.nullable(),
});

const backupSchema = z.object({
  backupType: z.literal(EASY_INVOICE_BACKUP_TYPE),
  backupVersion: z.literal(EASY_INVOICE_BACKUP_VERSION),
  createdAt: isoTimestampSchema,
  appVersion: z.string(),
  data: backupDataSchema,
});

export function parseAndValidateBackupJson(text: string): EasyInvoiceBackup {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new BackupInvalidError();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    throw new BackupInvalidError();
  }

  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BackupInvalidError();
  }

  const record = parsed as Record<string, unknown>;
  if (record.backupType !== EASY_INVOICE_BACKUP_TYPE) {
    throw new BackupInvalidError();
  }
  if (typeof record.backupVersion !== 'number') {
    throw new BackupInvalidError();
  }
  if (record.backupVersion !== EASY_INVOICE_BACKUP_VERSION) {
    throw new BackupUnsupportedVersionError();
  }

  const result = backupSchema.safeParse(parsed);
  if (!result.success) {
    throw new BackupInvalidError();
  }

  assertUniqueIds(result.data.data.customers.map((customer) => customer.id));
  assertUniqueIds(result.data.data.products.map((product) => product.id));
  assertUniqueIds(result.data.data.invoices.map((invoice) => invoice.id));

  return result.data as EasyInvoiceBackup;
}

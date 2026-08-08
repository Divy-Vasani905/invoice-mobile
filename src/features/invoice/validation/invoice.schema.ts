import { z } from 'zod';

import { InvoiceStatus } from '@/types/models';

import {
  parsePriceInput,
  parseQuantityInput,
  parseTaxRatePercentToBasisPoints,
} from '../utils/invoice.utils';

const draftItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string(),
  name: z.string(),
  description: z.string(),
  unit: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
  taxRate: z.string(),
  discount: z.string(),
});

const finalItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string(),
  name: z.string(),
  description: z.string(),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z
    .string()
    .refine((value) => parseQuantityInput(value) != null, 'Enter a valid quantity greater than 0'),
  unitPrice: z.string().refine((value) => {
    const amount = parsePriceInput(value);
    return amount != null && amount >= 0;
  }, 'Enter a valid unit price'),
  taxRate: z
    .string()
    .refine((value) => parseTaxRatePercentToBasisPoints(value) != null, 'Enter a valid tax rate'),
  discount: z.string().refine((value) => {
    if (value.trim().length === 0) return true;
    const amount = parsePriceInput(value);
    return amount != null && amount >= 0;
  }, 'Enter a valid discount amount'),
});

export const invoiceDraftSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  customerId: z.string(),
  customerName: z.string(),
  issuedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid issue date'),
  dueAt: z.string(),
  currencyCode: z.string().min(1),
  notes: z.string(),
  items: z.array(draftItemSchema),
  status: z.nativeEnum(InvoiceStatus),
});

export const invoiceFinalSchema = z
  .object({
    invoiceNumber: z.string().min(1, 'Invoice number is required'),
    customerId: z.string().min(1, 'Select a customer'),
    customerName: z.string(),
    issuedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid issue date'),
    dueAt: z.string(),
    currencyCode: z.string().min(1),
    notes: z.string(),
    items: z.array(finalItemSchema).min(1, 'Add at least one item'),
    status: z.nativeEnum(InvoiceStatus),
  })
  .superRefine((values, context) => {
    values.items.forEach((item, index) => {
      const label = item.name.trim() || item.description.trim();
      if (label.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Item description is required',
          path: ['items', index, 'name'],
        });
      }
    });

    if (values.dueAt.trim().length > 0) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(values.dueAt)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid due date',
          path: ['dueAt'],
        });
        return;
      }
      if (values.dueAt < values.issuedAt) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Due date cannot be before the issue date',
          path: ['dueAt'],
        });
      }
    }
  });

export type InvoiceDraftSchema = z.infer<typeof invoiceDraftSchema>;
export type InvoiceFinalSchema = z.infer<typeof invoiceFinalSchema>;

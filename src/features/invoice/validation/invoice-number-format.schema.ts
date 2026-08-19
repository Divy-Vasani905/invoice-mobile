import { z } from 'zod';

import { MAX_INVOICE_NUMBER_PADDING, MIN_INVOICE_NUMBER_PADDING } from '@/types/models';

const PREFIX_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._\-/#]*$/;
const MAX_SEQUENCE = 1_000_000_000_000;

export const invoiceNumberFormatSchema = z.object({
  prefix: z
    .string()
    .trim()
    .min(1, 'Enter a prefix')
    .max(24, 'Prefix must be 24 characters or fewer')
    .regex(PREFIX_PATTERN, 'Use letters, numbers, spaces, or separators such as - / _ #'),
  nextNumber: z
    .string()
    .trim()
    .min(1, 'Enter the next invoice number')
    .regex(/^\d+$/, 'Enter a whole number without decimals')
    .refine((value) => {
      const parsed = Number(value);
      return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= MAX_SEQUENCE;
    }, `Enter a number between 1 and ${MAX_SEQUENCE.toLocaleString()}`),
  padding: z
    .string()
    .trim()
    .min(1, 'Enter number padding')
    .regex(/^\d+$/, 'Enter a whole number without decimals')
    .refine((value) => {
      const parsed = Number(value);
      return (
        Number.isSafeInteger(parsed) &&
        parsed >= MIN_INVOICE_NUMBER_PADDING &&
        parsed <= MAX_INVOICE_NUMBER_PADDING
      );
    }, `Padding must be between ${MIN_INVOICE_NUMBER_PADDING} and ${MAX_INVOICE_NUMBER_PADDING}`),
});

export type InvoiceNumberFormatFormValues = z.infer<typeof invoiceNumberFormatSchema>;

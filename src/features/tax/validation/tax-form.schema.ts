import { z } from 'zod';

import { MAX_TAX_NAME_LENGTH, parseTaxPercentToBasisPoints } from '../utils/tax.utils';

export const taxFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a tax name')
    .max(MAX_TAX_NAME_LENGTH, `Tax name must be ${MAX_TAX_NAME_LENGTH} characters or fewer`),
  ratePercent: z
    .string()
    .trim()
    .min(1, 'Enter a tax rate')
    .refine(
      (value) => parseTaxPercentToBasisPoints(value) != null,
      'Enter a rate between 0 and 100',
    ),
  setAsDefault: z.boolean(),
});

export type TaxFormValues = z.infer<typeof taxFormSchema>;

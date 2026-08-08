import { z } from 'zod';

import { ProductType, ProductUnit } from '@/types/models';

import { parsePriceInput, parseTaxRateInput } from '../utils/product.utils';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product / service name is required'),
  description: z.string(),
  type: z.nativeEnum(ProductType),
  sku: z.string(),
  unit: z.nativeEnum(ProductUnit),
  unitPrice: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .refine((value) => {
      const amount = parsePriceInput(value);
      return amount != null && amount >= 0;
    }, 'Enter a valid non-negative price'),
  taxRate: z
    .string()
    .trim()
    .refine((value) => {
      const rate = parseTaxRateInput(value);
      return rate != null && rate >= 0 && rate <= 100;
    }, 'Enter a tax rate between 0 and 100'),
  currencyCode: z.string().trim().min(1, 'Currency is required'),
  isActive: z.boolean(),
});

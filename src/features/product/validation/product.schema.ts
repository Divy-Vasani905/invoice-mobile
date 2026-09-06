import { z } from 'zod';

import { DiscountType, ProductType, ProductUnit } from '@/types/models';

import { parseDiscountInput, parsePriceInput, parseTaxRateInput } from '../utils/product.utils';

export const productSchema = z
  .object({
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
    discountType: z.nativeEnum(DiscountType),
    discount: z.string().trim(),
    taxRate: z
      .string()
      .trim()
      .refine((value) => {
        const rate = parseTaxRateInput(value);
        return rate != null && rate >= 0 && rate <= 100;
      }, 'Enter a tax rate between 0 and 100'),
    currencyCode: z.string().trim().min(1, 'Currency is required'),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const discountVal = parseDiscountInput(data.discount);
    if (discountVal == null || discountVal < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount'],
        message: 'Enter a valid non-negative discount',
      });
      return;
    }
    if (data.discountType === DiscountType.Percentage) {
      if (discountVal > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discount'],
          message: 'Discount percentage cannot exceed 100%',
        });
      }
    } else if (data.discountType === DiscountType.FixedAmount) {
      const priceVal = parsePriceInput(data.unitPrice) ?? 0;
      if (discountVal > priceVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discount'],
          message: 'Flat discount cannot exceed unit price',
        });
      }
    }
  });

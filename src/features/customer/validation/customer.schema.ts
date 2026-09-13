import { z } from 'zod';

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || z.email().safeParse(value).success,
    'Enter a valid email address',
  );

const requiredPhone = z
  .string()
  .trim()
  .min(7, 'Phone number is required')
  .refine(
    (value) => /^(?=(?:\D*\d){7,15}\D*$)\+?[\d\s().-]+$/.test(value),
    'Enter a valid phone number with 7 to 15 digits',
  );

export const customerSchema = z.object({
  displayName: z.string().trim().min(1, 'Customer name is required'),
  companyName: z.string(),
  phone: requiredPhone,
  email: optionalEmail,
  taxId: z.string(),
  billingAddress: z.string(),
  notes: z.string(),
});

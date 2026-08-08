import { z } from 'zod';

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || z.email().safeParse(value).success,
    'Enter a valid email address',
  );

const optionalPhone = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || /^(?=(?:\D*\d){7,15}\D*$)\+?[\d\s().-]+$/.test(value),
    'Enter a valid phone number with 7 to 15 digits',
  );

const optionalWebsite = z
  .string()
  .trim()
  .refine((value) => {
    if (value.length === 0) return true;
    try {
      const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      const url = new URL(withProtocol);
      return url.hostname.includes('.');
    } catch {
      return false;
    }
  }, 'Enter a valid website URL');

export const businessSchema = z.object({
  displayName: z.string().trim().min(1, 'Business name is required'),
  taxId: z.string(),
  phone: optionalPhone,
  email: optionalEmail,
  website: optionalWebsite,
  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  countryCode: z.string(),
  logoUri: z.string(),
  authorizedSignatureUri: z.string(),
  defaultInvoiceNotes: z.string(),
});

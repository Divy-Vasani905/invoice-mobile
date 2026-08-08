import type { Business } from '@/types/models';

export interface BusinessFormValues {
  displayName: string;
  taxId: string;
  phone: string;
  email: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  logoUri: string;
  authorizedSignatureUri: string;
  defaultInvoiceNotes: string;
}

export type BusinessAssetKind = 'logo' | 'signature';

export interface BusinessSummary {
  business: Business;
  hasLogo: boolean;
  hasSignature: boolean;
  hasDefaultNotes: boolean;
  formattedAddress: string;
}

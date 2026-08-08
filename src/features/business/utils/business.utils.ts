import type { Address, Business } from '@/types/models';

import type { BusinessFormValues, BusinessSummary } from '../types/business.types';

export const EMPTY_BUSINESS_FORM: BusinessFormValues = {
  displayName: '',
  taxId: '',
  phone: '',
  email: '',
  website: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  countryCode: '',
  logoUri: '',
  authorizedSignatureUri: '',
  defaultInvoiceNotes: '',
};

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function compactOptional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function formatBusinessAddress(address?: Address): string {
  if (address == null) return '';
  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.countryCode,
  ]
    .filter((part) => part != null && part.length > 0)
    .join(', ');
}

export function toBusinessFormValues(business: Business): BusinessFormValues {
  return {
    displayName: business.displayName,
    taxId: business.taxId ?? '',
    phone: business.phone ?? '',
    email: business.email ?? '',
    website: business.website ?? '',
    addressLine1: business.address?.line1 ?? '',
    addressLine2: business.address?.line2 ?? '',
    city: business.address?.city ?? '',
    state: business.address?.state ?? '',
    postalCode: business.address?.postalCode ?? '',
    countryCode: business.address?.countryCode ?? '',
    logoUri: business.logoUri ?? '',
    authorizedSignatureUri: business.authorizedSignatureUri ?? '',
    defaultInvoiceNotes: business.defaultInvoiceNotes ?? '',
  };
}

export function toBusinessAddress(values: BusinessFormValues): Address | undefined {
  const line1 = compactOptional(values.addressLine1);
  const city = compactOptional(values.city);
  const countryCode = compactOptional(values.countryCode);
  if (line1 == null && city == null && countryCode == null) return undefined;

  return {
    line1: line1 ?? '',
    line2: compactOptional(values.addressLine2),
    city: city ?? '',
    state: compactOptional(values.state),
    postalCode: compactOptional(values.postalCode),
    countryCode: countryCode ?? '',
  };
}

export function toBusinessSummary(business: Business): BusinessSummary {
  return {
    business,
    hasLogo: business.logoUri != null && business.logoUri.length > 0,
    hasSignature:
      business.authorizedSignatureUri != null && business.authorizedSignatureUri.length > 0,
    hasDefaultNotes:
      business.defaultInvoiceNotes != null && business.defaultInvoiceNotes.trim().length > 0,
    formattedAddress: formatBusinessAddress(business.address),
  };
}

export function getBusinessInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

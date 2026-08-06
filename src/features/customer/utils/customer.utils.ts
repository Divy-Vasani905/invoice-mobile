import type { Address, Customer } from '@/types/models';

import type { CustomerFormValues } from '../types/customer.types';

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  displayName: '',
  companyName: '',
  phone: '',
  email: '',
  taxId: '',
  billingAddress: '',
  notes: '',
};

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function toCustomerFormValues(customer: Customer): CustomerFormValues {
  return {
    displayName: customer.displayName,
    companyName: customer.companyName ?? '',
    phone: customer.phone ?? '',
    email: customer.email ?? '',
    taxId: customer.taxId ?? '',
    billingAddress: formatAddress(customer.billingAddress),
    notes: customer.notes ?? '',
  };
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function compactOptional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function toAddress(value: string): Address | undefined {
  const line1 = compactOptional(value);
  return line1 == null ? undefined : { line1, city: '', countryCode: '' };
}

function formatAddress(address?: Address): string {
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

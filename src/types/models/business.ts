import type { Address, OfflineEntity } from '@/types/models/common';

export interface Business extends OfflineEntity {
  legalName: string;
  displayName: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  taxId?: string;
  registrationNumber?: string;
  logoUri?: string;
  defaultCurrencyCode: string;
}

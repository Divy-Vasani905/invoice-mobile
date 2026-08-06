import type { Address, OfflineEntity } from '@/types/models/common';

export interface Customer extends OfflineEntity {
  businessId: string;
  displayName: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  billingAddress?: Address;
  taxId?: string;
  notes?: string;
}

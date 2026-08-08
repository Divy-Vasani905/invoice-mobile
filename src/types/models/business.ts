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
  /** Local file URI for the authorized signature image used on invoices. */
  authorizedSignatureUri?: string;
  /** Default notes/terms applied when creating future invoices. */
  defaultInvoiceNotes?: string;
  defaultCurrencyCode: string;
}

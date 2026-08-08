import {
  businessRepository,
  type BusinessRepository as BusinessStorageRepository,
} from '@/storage';
import { SyncStatus, type Business } from '@/types/models';

import {
  compactOptional,
  createLocalId,
  toBusinessAddress,
  toBusinessSummary,
} from '../utils/business.utils';

import type { BusinessFormValues, BusinessSummary } from '../types/business.types';

/** Feature adapter over the existing singleton MMKV business repository. */
export class BusinessRepository {
  public constructor(private readonly storage: BusinessStorageRepository = businessRepository) {}

  public getBusinesses(): BusinessSummary[] {
    const business = this.getActiveBusiness();
    return business == null ? [] : [toBusinessSummary(business)];
  }

  public getBusinessById(businessId: string): Business | null {
    const business = this.getActiveBusiness();
    if (business == null || business.id !== businessId) return null;
    return business;
  }

  public getActiveBusiness(): Business | null {
    const business = this.storage.get();
    if (business == null || business.syncStatus === SyncStatus.Deleted) return null;
    return business;
  }

  public getActiveBusinessSummary(): BusinessSummary | null {
    const business = this.getActiveBusiness();
    return business == null ? null : toBusinessSummary(business);
  }

  /**
   * Singleton storage currently supports one active business.
   * Kept for future multi-business / Premium unlimited support.
   */
  public setActiveBusiness(businessId: string): Business {
    const business = this.getBusinessById(businessId);
    if (business == null) throw new Error('Business not found.');
    return business;
  }

  public createBusiness(values: BusinessFormValues): Business {
    if (this.getActiveBusiness() != null) {
      throw new Error('A business profile already exists. Edit the current profile instead.');
    }

    const timestamp = new Date().toISOString();
    const business: Business = {
      ...toPersistedFields(values),
      id: createLocalId('business'),
      createdAt: timestamp,
      updatedAt: timestamp,
      localRevision: 1,
      syncStatus: SyncStatus.Pending,
      defaultCurrencyCode: 'USD',
    };
    this.storage.create(business);
    return business;
  }

  public updateBusiness(values: BusinessFormValues): Business {
    const current = this.requireBusiness();
    const business: Business = {
      ...current,
      ...toPersistedFields(values),
      updatedAt: new Date().toISOString(),
      localRevision: current.localRevision + 1,
      syncStatus: SyncStatus.Pending,
    };
    this.storage.update(business);
    return business;
  }

  public deleteBusiness(): void {
    this.requireBusiness();
    this.storage.delete();
  }

  private requireBusiness(): Business {
    const business = this.getActiveBusiness();
    if (business == null) throw new Error('Business not found.');
    return business;
  }
}

function toPersistedFields(values: BusinessFormValues) {
  const displayName = values.displayName.trim();
  return {
    displayName,
    legalName: displayName,
    taxId: compactOptional(values.taxId),
    phone: compactOptional(values.phone),
    email: compactOptional(values.email),
    website: normalizeWebsite(values.website),
    address: toBusinessAddress(values),
    logoUri: compactOptional(values.logoUri),
    authorizedSignatureUri: compactOptional(values.authorizedSignatureUri),
    defaultInvoiceNotes: compactOptional(values.defaultInvoiceNotes),
  };
}

function normalizeWebsite(value: string): string | undefined {
  const website = compactOptional(value);
  if (website == null) return undefined;
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export const businessFeatureRepository = new BusinessRepository();

/**
 * Local-first entity metadata shared by every persisted domain model.
 * Timestamp values are ISO 8601 UTC strings.
 */
export interface EntityIdentity {
  id: string;
}

export interface EntityTimestamps {
  createdAt: string;
  updatedAt: string;
}

export enum SyncStatus {
  Pending = 'pending',
  Synced = 'synced',
  Conflict = 'conflict',
  Deleted = 'deleted',
}

/**
 * Metadata needed to reconcile an offline record with a future cloud source.
 */
export interface SyncMetadata {
  localRevision: number;
  syncStatus: SyncStatus;
  remoteId?: string;
  lastSyncedAt?: string;
  deletedAt?: string;
}

export interface OfflineEntity extends EntityIdentity, EntityTimestamps, SyncMetadata {}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  countryCode: string;
}

/**
 * Monetary amounts are stored as integer minor units to avoid floating-point
 * precision loss. `currencyCode` uses ISO 4217 codes.
 */
export interface Money {
  amountMinor: number;
  currencyCode: string;
}

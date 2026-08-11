import type { AdMonetizationState } from '@/services/ads/types';
import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import { JsonSingletonRepository } from '@/storage/repositories/json-repository';

export interface AdMonetizationRepository {
  get(): AdMonetizationState | null;
  update(state: AdMonetizationState): void;
}

export class MmkvAdMonetizationRepository
  extends JsonSingletonRepository<AdMonetizationState>
  implements AdMonetizationRepository
{
  public constructor(storage: StorageDriver, storageKey: string) {
    super(storage, storageKey);
  }
}

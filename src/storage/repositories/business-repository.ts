import type { BusinessRepository } from '@/storage/interfaces/business-repository';
import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import { JsonSingletonCrudRepository } from '@/storage/repositories/json-repository';
import type { Business } from '@/types/models';

export class MmkvBusinessRepository
  extends JsonSingletonCrudRepository<Business>
  implements BusinessRepository
{
  public constructor(storage: StorageDriver, storageKey: string) {
    super(storage, storageKey);
  }
}

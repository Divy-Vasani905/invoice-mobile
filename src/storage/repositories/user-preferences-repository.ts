import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import type { UserPreferencesRepository } from '@/storage/interfaces/user-preferences-repository';
import { JsonSingletonRepository } from '@/storage/repositories/json-repository';
import type { UserPreferences } from '@/types/models/user-preferences';

export class MmkvUserPreferencesRepository
  extends JsonSingletonRepository<UserPreferences>
  implements UserPreferencesRepository
{
  public constructor(storage: StorageDriver, storageKey: string) {
    super(storage, storageKey);
  }
}

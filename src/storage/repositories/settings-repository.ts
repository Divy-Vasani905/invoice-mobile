import type { SettingsRepository } from '@/storage/interfaces/settings-repository';
import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import { JsonSingletonRepository } from '@/storage/repositories/json-repository';
import type { AppSettings } from '@/types/models';

export class MmkvSettingsRepository
  extends JsonSingletonRepository<AppSettings>
  implements SettingsRepository
{
  public constructor(storage: StorageDriver, storageKey: string) {
    super(storage, storageKey);
  }
}

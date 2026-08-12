import type { GlobalConfig, MonetizationConfig } from '@/services/remote-config/types';
import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import { JsonSingletonRepository } from '@/storage/repositories/json-repository';

export interface RemoteConfigRepository {
  getGlobalConfig(): GlobalConfig | null;
  saveGlobalConfig(config: GlobalConfig): void;
  getMonetizationConfig(): MonetizationConfig | null;
  saveMonetizationConfig(config: MonetizationConfig): void;
  getUpdateDismissedAt(): number | null;
  saveUpdateDismissedAt(timestamp: number): void;
  clearUpdateDismissedAt(): void;
}

/**
 * MMKV persistence for last-known-valid Remote Config + optional update dismissal.
 */
export class MmkvRemoteConfigRepository implements RemoteConfigRepository {
  private readonly globalRepo: JsonSingletonRepository<GlobalConfig>;
  private readonly monetizationRepo: JsonSingletonRepository<MonetizationConfig>;

  public constructor(
    private readonly storage: StorageDriver,
    globalKey: string,
    monetizationKey: string,
    private readonly updateDismissedAtKey: string,
  ) {
    this.globalRepo = new JsonSingletonRepository(storage, globalKey);
    this.monetizationRepo = new JsonSingletonRepository(storage, monetizationKey);
  }

  public getGlobalConfig(): GlobalConfig | null {
    try {
      return this.globalRepo.get();
    } catch {
      return null;
    }
  }

  public saveGlobalConfig(config: GlobalConfig): void {
    this.globalRepo.update(config);
  }

  public getMonetizationConfig(): MonetizationConfig | null {
    try {
      return this.monetizationRepo.get();
    } catch {
      return null;
    }
  }

  public saveMonetizationConfig(config: MonetizationConfig): void {
    this.monetizationRepo.update(config);
  }

  public getUpdateDismissedAt(): number | null {
    const raw = this.storage.getString(this.updateDismissedAtKey);
    if (raw == null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }

  public saveUpdateDismissedAt(timestamp: number): void {
    this.storage.set(this.updateDismissedAtKey, String(timestamp));
  }

  public clearUpdateDismissedAt(): void {
    this.storage.remove(this.updateDismissedAtKey);
  }
}

import type {
  CrudRepository,
  SingletonCrudRepository,
  SingletonRepository,
} from '@/storage/interfaces/repository';
import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import type { EntityIdentity } from '@/types/models';

/**
 * Reusable JSON-backed CRUD repository for ID-addressable MMKV collections.
 * Records are keyed by ID so individual lookups do not require domain logic.
 */
export class JsonRepository<TEntity extends EntityIdentity> implements CrudRepository<TEntity> {
  public constructor(
    private readonly storage: StorageDriver,
    private readonly storageKey: string,
  ) {}

  public create(entity: TEntity): void {
    const records = this.read();
    records[entity.id] = entity;
    this.write(records);
  }

  public getById(id: string): TEntity | null {
    return this.read()[id] ?? null;
  }

  public getAll(): TEntity[] {
    return Object.values(this.read());
  }

  public update(entity: TEntity): void {
    const records = this.read();
    records[entity.id] = entity;
    this.write(records);
  }

  public delete(id: string): void {
    const records = this.read();
    delete records[id];
    this.write(records);
  }

  public clear(): void {
    this.write({});
  }

  private read(): Record<string, TEntity> {
    const value = this.storage.getString(this.storageKey);
    return value == null ? {} : (JSON.parse(value) as Record<string, TEntity>);
  }

  private write(records: Record<string, TEntity>): void {
    this.storage.set(this.storageKey, JSON.stringify(records));
  }
}

/**
 * Reusable JSON-backed repository for a single persisted aggregate.
 */
export class JsonSingletonRepository<TEntity> implements SingletonRepository<TEntity> {
  public constructor(
    protected readonly storage: StorageDriver,
    protected readonly storageKey: string,
  ) {}

  public get(): TEntity | null {
    const value = this.storage.getString(this.storageKey);
    return value == null ? null : (JSON.parse(value) as TEntity);
  }

  public update(entity: TEntity): void {
    this.storage.set(this.storageKey, JSON.stringify(entity));
  }
}

export class JsonSingletonCrudRepository<TEntity>
  extends JsonSingletonRepository<TEntity>
  implements SingletonCrudRepository<TEntity>
{
  public create(entity: TEntity): void {
    this.update(entity);
  }

  public delete(): void {
    this.storage.remove(this.storageKey);
  }
}

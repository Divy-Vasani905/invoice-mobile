import type { EntityIdentity } from '@/types/models';

export interface CrudRepository<TEntity extends EntityIdentity> {
  create(entity: TEntity): void;
  getById(id: string): TEntity | null;
  getAll(): TEntity[];
  update(entity: TEntity): void;
  delete(id: string): void;
}

export interface SingletonRepository<TEntity> {
  get(): TEntity | null;
  update(entity: TEntity): void;
}

export interface SingletonCrudRepository<TEntity> extends SingletonRepository<TEntity> {
  create(entity: TEntity): void;
  delete(): void;
}

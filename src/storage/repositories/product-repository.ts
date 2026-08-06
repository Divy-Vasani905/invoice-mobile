import type { ProductRepository } from '@/storage/interfaces/product-repository';
import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import { JsonRepository } from '@/storage/repositories/json-repository';
import type { Product } from '@/types/models';

export class MmkvProductRepository extends JsonRepository<Product> implements ProductRepository {
  public constructor(storage: StorageDriver, storageKey: string) {
    super(storage, storageKey);
  }
}

import type { CustomerRepository } from '@/storage/interfaces/customer-repository';
import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import { JsonRepository } from '@/storage/repositories/json-repository';
import type { Customer } from '@/types/models';

export class MmkvCustomerRepository extends JsonRepository<Customer> implements CustomerRepository {
  public constructor(storage: StorageDriver, storageKey: string) {
    super(storage, storageKey);
  }
}

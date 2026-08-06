import type { InvoiceRepository } from '@/storage/interfaces/invoice-repository';
import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import { JsonRepository } from '@/storage/repositories/json-repository';
import type { Invoice } from '@/types/models';

export class MmkvInvoiceRepository extends JsonRepository<Invoice> implements InvoiceRepository {
  public constructor(storage: StorageDriver, storageKey: string) {
    super(storage, storageKey);
  }
}

import type { InvoiceCreditRepository } from '@/storage/interfaces/invoice-credit-repository';
import type { StorageDriver } from '@/storage/interfaces/storage-driver';
import { JsonSingletonRepository } from '@/storage/repositories/json-repository';
import type { InvoiceCreditBalance } from '@/types/models';

export class MmkvInvoiceCreditRepository
  extends JsonSingletonRepository<InvoiceCreditBalance>
  implements InvoiceCreditRepository
{
  public constructor(storage: StorageDriver, storageKey: string) {
    super(storage, storageKey);
  }
}

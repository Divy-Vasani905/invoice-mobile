import type { InvoiceCreditBalance } from '@/types/models';

export interface InvoiceCreditRepository {
  get(): InvoiceCreditBalance | null;
  update(balance: InvoiceCreditBalance): void;
}

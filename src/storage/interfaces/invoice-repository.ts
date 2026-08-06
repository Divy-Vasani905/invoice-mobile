import type { Invoice } from '@/types/models';

export interface InvoiceRepository {
  create(invoice: Invoice): void;
  getById(id: string): Invoice | null;
  getAll(): Invoice[];
  update(invoice: Invoice): void;
  delete(id: string): void;
}

import type { Customer } from '@/types/models';

export interface CustomerRepository {
  create(customer: Customer): void;
  getById(id: string): Customer | null;
  getAll(): Customer[];
  update(customer: Customer): void;
  delete(id: string): void;
}

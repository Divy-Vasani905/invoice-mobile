import type { Product } from '@/types/models';

export interface ProductRepository {
  create(product: Product): void;
  getById(id: string): Product | null;
  getAll(): Product[];
  update(product: Product): void;
  delete(id: string): void;
}

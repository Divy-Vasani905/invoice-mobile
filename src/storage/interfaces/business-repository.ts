import type { Business } from '@/types/models';

export interface BusinessRepository {
  create(business: Business): void;
  get(): Business | null;
  update(business: Business): void;
  delete(): void;
}

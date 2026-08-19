import type { UserPreferences } from '@/types/models/user-preferences';

export interface UserPreferencesRepository {
  get(): UserPreferences | null;
  update(preferences: UserPreferences): void;
}

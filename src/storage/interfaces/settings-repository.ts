import type { AppSettings } from '@/types/models';

export interface SettingsRepository {
  get(): AppSettings | null;
  update(settings: AppSettings): void;
}

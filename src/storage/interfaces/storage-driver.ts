/**
 * Minimal MMKV contract consumed by repositories.
 * Keeping it independent of MMKV's concrete type makes repositories reusable.
 */
export interface StorageDriver {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
}

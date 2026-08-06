import { createMMKV } from 'react-native-mmkv';

/**
 * Shared persistent key-value store for the local data layer.
 * All repositories receive this instance through their constructors.
 */
export const storage = createMMKV({
  id: 'invoice-mobile',
});

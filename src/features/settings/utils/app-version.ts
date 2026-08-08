import Constants from 'expo-constants';

/** Resolves the app version from Expo config with a safe fallback. */
export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? Constants.nativeApplicationVersion ?? '1.0.0';
}

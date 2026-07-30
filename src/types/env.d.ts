/**
 * Ambient typings for Expo public environment variables.
 * Keeps `process.env.EXPO_PUBLIC_*` typed across the project.
 */

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly EXPO_PUBLIC_API_URL?: string;
      readonly EXPO_PUBLIC_FIREBASE_API_KEY?: string;
    }
  }
}

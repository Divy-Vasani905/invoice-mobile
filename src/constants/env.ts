/**
 * Typed access to Expo public environment variables.
 *
 * Values are inlined by Metro from `.env` / `.env.*` files at bundle time.
 * Always reference them with static `process.env.EXPO_PUBLIC_*` property access.
 *
 * @see https://docs.expo.dev/guides/environment-variables/
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';

export const env = {
  apiUrl: API_URL,
  firebaseApiKey: FIREBASE_API_KEY,
} as const;

export type Env = typeof env;

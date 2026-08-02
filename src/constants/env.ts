/**
 * Typed access to Expo public environment variables.
 *
 * Values are inlined by Metro from `.env` / `.env.*` files at bundle time.
 * Always reference them with static `process.env.EXPO_PUBLIC_*` property access.
 *
 * @see https://docs.expo.dev/guides/environment-variables/
 */

const read = (value: string | undefined): string => value?.trim() ?? '';

export const env = {
  apiUrl: read(process.env.EXPO_PUBLIC_API_URL),
  /** @deprecated Prefer `env.firebase.apiKey`. */
  firebaseApiKey: read(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),

  firebase: {
    apiKey: read(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    authDomain: read(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: read(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: read(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: read(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: read(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
    measurementId: read(process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID),
  },

  admob: {
    androidAppId: read(process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID),
    iosAppId: read(process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID),
    bannerUnitId: read(process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID),
    interstitialUnitId: read(process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID),
    rewardedUnitId: read(process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID),
  },

  revenueCat: {
    androidApiKey: read(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY),
    iosApiKey: read(process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY),
  },

  easProjectId: read(process.env.EXPO_PUBLIC_EAS_PROJECT_ID),
} as const;

export type Env = typeof env;

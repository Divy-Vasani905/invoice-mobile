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
      readonly EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
      readonly EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
      readonly EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
      readonly EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
      readonly EXPO_PUBLIC_FIREBASE_APP_ID?: string;
      readonly EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;

      readonly EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?: string;
      readonly EXPO_PUBLIC_ADMOB_IOS_APP_ID?: string;
      readonly EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID?: string;
      readonly EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID?: string;
      readonly EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID?: string;

      readonly EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?: string;
      readonly EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?: string;

      readonly EXPO_PUBLIC_EAS_PROJECT_ID?: string;
    }
  }
}

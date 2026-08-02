import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getAnalytics,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';
import { getMessaging } from '@react-native-firebase/messaging';

let initialized = false;

/**
 * Initializes React Native Firebase Analytics + Crashlytics collection.
 * Messaging is resolved so the native module is ready for future push work.
 * Does not register handlers or request notification permissions.
 */
export async function initializeFirebase(): Promise<boolean> {
  if (initialized || Platform.OS === 'web') {
    return initialized;
  }

  try {
    const app = getApp();
    const analytics = getAnalytics(app);
    const crashlytics = getCrashlytics(app);

    await Promise.all([
      setAnalyticsCollectionEnabled(analytics, !__DEV__),
      setCrashlyticsCollectionEnabled(crashlytics, true),
    ]);

    // Touch messaging so the module is linked/ready for future push setup.
    getMessaging(app);

    initialized = true;
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('[firebase] initialization skipped/failed:', error);
    }
    return false;
  }
}

export function isFirebaseInitialized(): boolean {
  return initialized;
}

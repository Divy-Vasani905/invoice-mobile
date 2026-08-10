import { getAnalytics, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';
import { getMessaging } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

import { AnalyticsEvents, AnalyticsService } from '@/services/analytics';
import { CrashlyticsService } from '@/services/crashlytics';

let initialized = false;

/**
 * Initializes React Native Firebase Analytics + Crashlytics collection.
 * Uses native google-services configuration (no Firebase Web SDK).
 * Messaging is resolved so the native module stays linked for future push work,
 * but no handlers or permission prompts are registered here.
 */
export async function initializeFirebase(): Promise<boolean> {
  if (initialized || Platform.OS === 'web') {
    return initialized;
  }

  try {
    const app = getApp();
    const analytics = getAnalytics(app);
    const crashlytics = getCrashlytics(app);

    // Keep Analytics enabled in development so Firebase DebugView can verify events.
    await Promise.all([
      setAnalyticsCollectionEnabled(analytics, true),
      setCrashlyticsCollectionEnabled(crashlytics, true),
    ]);

    // Touch messaging so the module is linked/ready for future push setup.
    getMessaging(app);

    await CrashlyticsService.setAttribute('app_runtime', __DEV__ ? 'development' : 'production');
    CrashlyticsService.log('Firebase initialized');

    initialized = true;

    void AnalyticsService.logEvent(AnalyticsEvents.AppOpened, {
      platform: Platform.OS,
    });

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

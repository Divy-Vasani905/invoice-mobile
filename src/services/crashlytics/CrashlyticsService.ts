import { getApp } from '@react-native-firebase/app';
import {
  getCrashlytics,
  log as crashlyticsLog,
  recordError,
  setAttribute,
} from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === 'string' ? error : 'Unknown error');
}

/**
 * Thin Crashlytics facade. Never stores PII attributes.
 * Safe no-op when Firebase is unavailable (web / init failure).
 */
export const CrashlyticsService = {
  log(message: string): void {
    if (Platform.OS === 'web') return;
    try {
      crashlyticsLog(getCrashlytics(getApp()), message);
    } catch (error) {
      if (__DEV__) {
        console.warn('[crashlytics] log failed:', error);
      }
    }
  },

  recordError(error: unknown, jsErrorName?: string): void {
    if (Platform.OS === 'web') return;
    try {
      recordError(getCrashlytics(getApp()), toError(error), jsErrorName);
    } catch (reportingError) {
      if (__DEV__) {
        console.warn('[crashlytics] recordError failed:', reportingError);
      }
    }
  },

  async setAttribute(name: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await setAttribute(getCrashlytics(getApp()), name, value);
    } catch (error) {
      if (__DEV__) {
        console.warn('[crashlytics] setAttribute failed:', error);
      }
    }
  },
};

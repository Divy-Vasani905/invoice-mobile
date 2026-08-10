import { getAnalytics, logEvent, logScreenView } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';

import type { AnalyticsEventName, AnalyticsEventParams } from './events';

/**
 * Thin Analytics facade over React Native Firebase.
 * Failures are swallowed so offline-first UX is never blocked.
 */
export const AnalyticsService = {
  async logEvent(name: AnalyticsEventName, params?: AnalyticsEventParams): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const analytics = getAnalytics(getApp());
      logEvent(analytics, name, params);
    } catch (error) {
      if (__DEV__) {
        console.warn('[analytics] logEvent failed:', name, error);
      }
    }
  },

  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const analytics = getAnalytics(getApp());
      await logScreenView(analytics, {
        screen_name: screenName,
        screen_class: screenClass ?? screenName,
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('[analytics] logScreenView failed:', screenName, error);
      }
    }
  },
};

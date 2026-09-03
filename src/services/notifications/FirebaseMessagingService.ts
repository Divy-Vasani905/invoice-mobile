import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
} from './AutoBackupReminderService';

import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export const FCM_NOTIFICATION_CHANNEL_ID = 'firebase-cloud';

async function ensureFirebaseNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(FCM_NOTIFICATION_CHANNEL_ID, {
    name: 'Cloud notifications',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function getFcmToken(): Promise<string | null> {
  try {
    let permission = await getNotificationPermissionStatus();

    if (!permission.granted) {
      permission = await requestNotificationPermission();
    }

    if (!permission.granted) {
      console.log('[FCM] Notification permission denied');
      return null;
    }

    await ensureFirebaseNotificationChannel();

    const messaging = getMessaging();

    await registerDeviceForRemoteMessages(messaging);

    const token = await getToken(messaging);

    console.log('[FCM] FCM token:', token);

    return token;
  } catch (error) {
    console.error('[FCM] Failed to get FCM token:', error);
    return null;
  }
}

export function subscribeToFcmTokenRefresh(onToken: (token: string) => void): () => void {
  const messaging = getMessaging();

  return onTokenRefresh(messaging, (token) => {
    console.log('[FCM] Token refreshed:', token);

    onToken(token);
  });
}

export function subscribeToForegroundMessages(
  onMessageReceived?: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): () => void {
  const messaging = getMessaging();

  return onMessage(messaging, async (remoteMessage) => {
    console.log('[FCM] Foreground message:', remoteMessage);

    onMessageReceived?.(remoteMessage);

    await ensureFirebaseNotificationChannel();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title ?? 'Easy Invoice Maker',

        body: remoteMessage.notification?.body ?? '',

        data: remoteMessage.data ?? {},

        sound: true,

        ...(Platform.OS === 'android' ? { channelId: FCM_NOTIFICATION_CHANNEL_ID } : {}),
      },

      trigger: null,
    });
  });
}

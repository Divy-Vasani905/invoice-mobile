import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { CrashlyticsService } from '@/services/crashlytics';
import { useUserPreferencesStore } from '@/stores/user-preferences';

import {
  AUTO_BACKUP_REMINDER_CHANNEL_ID,
  AUTO_BACKUP_REMINDER_CONFIG,
  AUTO_BACKUP_REMINDER_CONTENT,
  AUTO_BACKUP_REMINDER_DATA_TYPE,
  AUTO_BACKUP_REMINDER_NOTIFICATION_ID,
} from './constants';

import type {
  EnableAutoBackupReminderResult,
  NotificationPermissionSnapshot,
  SyncAutoBackupReminderResult,
} from './types';

const DENIED_PERMISSION: NotificationPermissionSnapshot = {
  granted: false,
  canAskAgain: false,
};

let lastHandledReminderResponseKey: string | null = null;
let androidChannelReady = false;

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function isNotificationsSupported(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

function toPermissionSnapshot(
  response: Notifications.NotificationPermissionsStatus,
): NotificationPermissionSnapshot {
  return {
    granted: response.granted === true || response.status === 'granted',
    canAskAgain: response.canAskAgain !== false,
  };
}

function isAutoBackupReminderResponse(response: Notifications.NotificationResponse): boolean {
  const { identifier, content } = response.notification.request;
  if (identifier === AUTO_BACKUP_REMINDER_NOTIFICATION_ID) return true;
  return content.data?.type === AUTO_BACKUP_REMINDER_DATA_TYPE;
}

function reminderResponseKey(response: Notifications.NotificationResponse): string {
  return `${response.notification.request.identifier}:${String(response.notification.date)}`;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android' || androidChannelReady) return;
  await Notifications.setNotificationChannelAsync(AUTO_BACKUP_REMINDER_CHANNEL_ID, {
    name: 'Backup reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  androidChannelReady = true;
}

function recordNotificationError(error: unknown, name: string): void {
  CrashlyticsService.log(`[notifications] ${name}`);
  CrashlyticsService.recordError(error, name);
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionSnapshot> {
  if (!isNotificationsSupported()) return DENIED_PERMISSION;
  try {
    const status = await Notifications.getPermissionsAsync();
    return toPermissionSnapshot(status);
  } catch (error) {
    recordNotificationError(error, 'NotificationPermissionStatusFailed');
    return DENIED_PERMISSION;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionSnapshot> {
  if (!isNotificationsSupported()) return DENIED_PERMISSION;
  try {
    await ensureAndroidChannel();
    const status = await Notifications.requestPermissionsAsync();
    return toPermissionSnapshot(status);
  } catch (error) {
    recordNotificationError(error, 'NotificationPermissionRequestFailed');
    return DENIED_PERMISSION;
  }
}

export async function openNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (error) {
    recordNotificationError(error, 'OpenNotificationSettingsFailed');
  }
}

function isMonthlyLikeTrigger(trigger: Notifications.NotificationTrigger): boolean {
  if (typeof trigger !== 'object' || trigger == null) return false;
  if ('type' in trigger && String(trigger.type).toLowerCase().includes('month')) {
    return true;
  }
  return 'month' in trigger && trigger.month != null;
}

function shouldCancelScheduledReminder(notification: Notifications.NotificationRequest): boolean {
  if (notification.identifier === AUTO_BACKUP_REMINDER_NOTIFICATION_ID) return true;
  if (notification.content.data?.type === AUTO_BACKUP_REMINDER_DATA_TYPE) return true;
  if (notification.content.title === AUTO_BACKUP_REMINDER_CONTENT.title) return true;

  const trigger = notification.trigger;
  if (trigger != null && typeof trigger === 'object') {
    if ('channelId' in trigger && trigger.channelId === AUTO_BACKUP_REMINDER_CHANNEL_ID) {
      return true;
    }
    if (
      isMonthlyLikeTrigger(trigger) &&
      notification.content.title === AUTO_BACKUP_REMINDER_CONTENT.title
    ) {
      return true;
    }
  }

  return false;
}

export async function cancelAutoBackupReminder(): Promise<void> {
  if (!isNotificationsSupported()) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(AUTO_BACKUP_REMINDER_NOTIFICATION_ID);
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter(shouldCancelScheduledReminder)
        .map((notification) =>
          Notifications.cancelScheduledNotificationAsync(notification.identifier),
        ),
    );
  } catch (error) {
    recordNotificationError(error, 'CancelAutoBackupReminderFailed');
  }
}

async function buildAutoBackupReminderContent(): Promise<Notifications.NotificationContentInput> {
  const content: Notifications.NotificationContentInput = {
    title: AUTO_BACKUP_REMINDER_CONTENT.title,
    body: AUTO_BACKUP_REMINDER_CONTENT.body,
    data: { type: AUTO_BACKUP_REMINDER_DATA_TYPE },
    sound: true,
    color: '#FFFFFF',
  };

  if (Platform.OS === 'ios') {
    try {
      const asset = Asset.fromModule(require('../../../../assets/images/icon-with-bg.png'));
      await asset.downloadAsync();
      if (asset.localUri != null) {
        content.attachments = [
          {
            identifier: 'auto-backup-reminder-logo',
            url: asset.localUri,
          },
        ];
      }
    } catch (error) {
      recordNotificationError(error, 'BackupReminderLogoAttachFailed');
    }
  }

  return content;
}

export async function scheduleAutoBackupReminder(): Promise<void> {
  if (!isNotificationsSupported()) {
    throw new Error('Local notifications are not available on this platform.');
  }

  await ensureAndroidChannel();
  await cancelAutoBackupReminder();

  const repeatingTrigger: Notifications.TimeIntervalTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: AUTO_BACKUP_REMINDER_CONFIG.intervalDays * 24 * 60 * 60,
    repeats: true,
    ...(Platform.OS === 'android' ? { channelId: AUTO_BACKUP_REMINDER_CHANNEL_ID } : {}),
  };

  await Notifications.scheduleNotificationAsync({
    identifier: AUTO_BACKUP_REMINDER_NOTIFICATION_ID,
    content: await buildAutoBackupReminderContent(),
    trigger: repeatingTrigger,
  });

  if (__DEV__) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const reminder = scheduled.filter(shouldCancelScheduledReminder);
    console.warn('[auto-backup-reminder] scheduled', JSON.stringify(reminder));
  }
}

/**
 * Makes scheduled reminder state match preference + OS permission.
 * Does not request permission.
 */
export async function syncAutoBackupReminder(): Promise<SyncAutoBackupReminderResult> {
  const preferenceEnabled = useUserPreferencesStore.getState().autoBackupReminderEnabled;

  if (!isNotificationsSupported()) {
    await cancelAutoBackupReminder();
    return { scheduled: false, reason: 'unavailable' };
  }

  if (!preferenceEnabled) {
    await cancelAutoBackupReminder();
    return { scheduled: false, reason: 'preference-off' };
  }

  const permission = await getNotificationPermissionStatus();
  if (!permission.granted) {
    await cancelAutoBackupReminder();
    return { scheduled: false, reason: 'permission-denied' };
  }

  try {
    await scheduleAutoBackupReminder();
    return { scheduled: true, reason: 'scheduled' };
  } catch (error) {
    recordNotificationError(error, 'ScheduleAutoBackupReminderFailed');
    await cancelAutoBackupReminder();
    useUserPreferencesStore.getState().setAutoBackupReminderEnabled(false);
    return { scheduled: false, reason: 'failed' };
  }
}

export async function disableAutoBackupReminder(): Promise<void> {
  useUserPreferencesStore.getState().setAutoBackupReminderEnabled(false);
  await cancelAutoBackupReminder();
}

/**
 * First-time post-onboarding native permission request.
 * Does not change onboarding completion. Existing users skip this via introShown.
 */
export async function requestOnboardingAutoBackupReminder(): Promise<void> {
  const store = useUserPreferencesStore.getState();
  if (store.autoBackupReminderIntroShown) return;

  store.markAutoBackupReminderIntroShown();

  try {
    const permission = await requestNotificationPermission();
    if (!permission.granted) {
      store.setAutoBackupReminderEnabled(false);
      await cancelAutoBackupReminder();
      return;
    }

    store.setAutoBackupReminderEnabled(true);
    await syncAutoBackupReminder();
  } catch (error) {
    recordNotificationError(error, 'OnboardingAutoBackupReminderFailed');
    useUserPreferencesStore.getState().setAutoBackupReminderEnabled(false);
    await cancelAutoBackupReminder();
  }
}

export async function enableAutoBackupReminder(): Promise<EnableAutoBackupReminderResult> {
  if (!isNotificationsSupported()) {
    await disableAutoBackupReminder();
    return { outcome: 'unavailable' };
  }

  let permission = await getNotificationPermissionStatus();

  if (!permission.granted) {
    permission = await requestNotificationPermission();
  }

  if (!permission.granted) {
    await disableAutoBackupReminder();
    return { outcome: permission.canAskAgain ? 'denied' : 'blocked' };
  }

  useUserPreferencesStore.getState().setAutoBackupReminderEnabled(true);
  const syncResult = await syncAutoBackupReminder();
  if (syncResult.scheduled) return { outcome: 'enabled' };

  await disableAutoBackupReminder();
  return { outcome: syncResult.reason === 'unavailable' ? 'unavailable' : 'failed' };
}

export function subscribeToAutoBackupReminderOpens(onOpen: () => void): () => void {
  if (!isNotificationsSupported()) return () => undefined;

  const handleResponse = (response: Notifications.NotificationResponse | null): void => {
    if (response == null || !isAutoBackupReminderResponse(response)) return;
    const key = reminderResponseKey(response);
    if (lastHandledReminderResponseKey === key) return;
    lastHandledReminderResponseKey = key;
    onOpen();
  };

  const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
  void Notifications.getLastNotificationResponseAsync()
    .then(handleResponse)
    .catch((error) => {
      recordNotificationError(error, 'LastNotificationResponseFailed');
    });

  return () => {
    subscription.remove();
  };
}

/** Dev helper: presents the backup reminder immediately without changing the 14-day schedule. */
export async function sendTestAutoBackupReminder(): Promise<boolean> {
  if (!isNotificationsSupported()) return false;

  try {
    let permission = await getNotificationPermissionStatus();
    if (!permission.granted) {
      permission = await requestNotificationPermission();
    }
    if (!permission.granted) return false;

    await ensureAndroidChannel();
    await Notifications.scheduleNotificationAsync({
      identifier: `${AUTO_BACKUP_REMINDER_NOTIFICATION_ID}-test`,
      content: await buildAutoBackupReminderContent(),
      trigger: null,
    });
    return true;
  } catch (error) {
    recordNotificationError(error, 'SendTestAutoBackupReminderFailed');
    return false;
  }
}

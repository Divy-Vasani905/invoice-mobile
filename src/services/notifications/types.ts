export type NotificationPermissionSnapshot = {
  granted: boolean;
  canAskAgain: boolean;
};

export type SyncAutoBackupReminderResult = {
  scheduled: boolean;
  reason: 'scheduled' | 'preference-off' | 'permission-denied' | 'unavailable' | 'failed';
};

export type EnableAutoBackupReminderResult =
  | { outcome: 'enabled' }
  | { outcome: 'denied' }
  | { outcome: 'blocked' }
  | { outcome: 'unavailable' }
  | { outcome: 'failed' };

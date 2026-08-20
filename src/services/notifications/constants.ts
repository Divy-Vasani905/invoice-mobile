/**
 * Local Auto Backup Reminder configuration.
 * Frequency is centralized so it can become user-configurable later.
 */
export const AUTO_BACKUP_REMINDER_NOTIFICATION_ID = 'auto-backup-reminder';

export const AUTO_BACKUP_REMINDER_DATA_TYPE = 'auto-backup-reminder';

export const AUTO_BACKUP_REMINDER_CHANNEL_ID = 'auto-backup-reminder';

export const AUTO_BACKUP_REMINDER_CONFIG = {
  intervalDays: 14,
} as const;

export const AUTO_BACKUP_REMINDER_CONTENT = {
  title: 'Time to back up your data',
  body: 'Protect your invoices, customers, and business settings by creating a new backup.',
} as const;

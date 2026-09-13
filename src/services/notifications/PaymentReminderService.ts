import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { showToast } from '@/components/feedback/Toast';
import { formatInvoiceDate, formatMoney } from '@/features/invoice/utils/invoice.utils';
import { CrashlyticsService } from '@/services/crashlytics';
import { invoiceRepository } from '@/storage';
import { getPreferredCurrencyCode, useUserPreferencesStore } from '@/stores/user-preferences';
import { InvoiceStatus, type Invoice } from '@/types/models';
import type { PaymentReminderType } from '@/types/models/user-preferences';

import { getNotificationPermissionStatus } from './AutoBackupReminderService';
import {
  PAYMENT_REMINDER_ACTION_CALL_CLIENT,
  PAYMENT_REMINDER_ACTION_VIEW_INVOICE,
  PAYMENT_REMINDER_CATEGORY_ID,
  PAYMENT_REMINDER_CHANNEL_ID,
  PAYMENT_REMINDER_DATA_TYPE,
} from './constants';

const ALL_REMINDER_TYPES: PaymentReminderType[] = [
  '7_DAYS_BEFORE',
  '2_DAYS_BEFORE',
  'DUE_DATE',
  '1_DAY_AFTER',
  '3_DAYS_AFTER',
  '7_DAYS_AFTER',
];

let categoryAndChannelReady = false;
let lastHandledResponseKey: string | null = null;

async function ensurePaymentReminderCategoryAndChannel(): Promise<void> {
  if (Platform.OS === 'web' || categoryAndChannelReady) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(PAYMENT_REMINDER_CHANNEL_ID, {
      name: 'Payment reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  await Notifications.setNotificationCategoryAsync(PAYMENT_REMINDER_CATEGORY_ID, [
    {
      identifier: PAYMENT_REMINDER_ACTION_VIEW_INVOICE,
      buttonTitle: 'View Invoice',
      options: { opensAppToForeground: true },
    },
    {
      identifier: PAYMENT_REMINDER_ACTION_CALL_CLIENT,
      buttonTitle: 'Call Client',
      options: { opensAppToForeground: true },
    },
  ]);

  categoryAndChannelReady = true;
}

function recordError(error: unknown, name: string): void {
  CrashlyticsService.log(`[payment-reminders] ${name}`);
  CrashlyticsService.recordError(error, name);
}

export function getPaymentReminderId(invoiceId: string, type: PaymentReminderType): string {
  return `payment_reminder_${invoiceId}_${type}`;
}

export async function cancelPaymentRemindersForInvoice(invoiceId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Promise.all(
      ALL_REMINDER_TYPES.map((type) =>
        Notifications.cancelScheduledNotificationAsync(getPaymentReminderId(invoiceId, type)),
      ),
    );
  } catch (error) {
    recordError(error, 'CancelPaymentRemindersForInvoiceFailed');
  }
}

export async function cancelAllPaymentReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const paymentReminders = scheduled.filter(
      (n) =>
        n.identifier.startsWith('payment_reminder_') ||
        n.content.data?.type === PAYMENT_REMINDER_DATA_TYPE,
    );

    await Promise.all(
      paymentReminders.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch (error) {
    recordError(error, 'CancelAllPaymentRemindersFailed');
  }
}

export function calculateReminderTriggerDate(
  dueAtIso: string,
  type: PaymentReminderType,
): Date | null {
  const dueDate = new Date(dueAtIso);
  if (Number.isNaN(dueDate.getTime())) return null;

  // Base calculation on start of due day at 09:00:00 AM local time
  const target = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 9, 0, 0, 0);

  switch (type) {
    case '7_DAYS_BEFORE':
      target.setDate(target.getDate() - 7);
      break;
    case '2_DAYS_BEFORE':
      target.setDate(target.getDate() - 2);
      break;
    case 'DUE_DATE':
      break;
    case '1_DAY_AFTER':
      target.setDate(target.getDate() + 1);
      break;
    case '3_DAYS_AFTER':
      target.setDate(target.getDate() + 3);
      break;
    case '7_DAYS_AFTER':
      target.setDate(target.getDate() + 7);
      break;
  }

  if (__DEV__) {
    const now = new Date();
    const _isSameDay =
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate();

    // if (isSameDay && target.getTime() <= now.getTime()) {
    //   return new Date(now.getTime() + 10 * 1000);
    // }
  }

  return target;
}

export function buildPaymentReminderContentInput(
  invoice: Invoice,
  type: PaymentReminderType,
): { title: string; body: string } {
  const currencyCode = getPreferredCurrencyCode();
  const formattedAmount = formatMoney(invoice.totals.totalAmount.amountMinor, currencyCode);
  const customerName = invoice.customer.name.trim() || 'your client';
  const invoiceNum = invoice.invoiceNumber.trim() || 'Draft';
  const formattedDueDate = invoice.dueAt ? formatInvoiceDate(invoice.dueAt) : '';

  switch (type) {
    case '7_DAYS_BEFORE':
      return {
        title: 'Payment due in 7 days',
        body: `Invoice #${invoiceNum} for ${formattedAmount} from ${customerName} is due on ${formattedDueDate}.`,
      };
    case '2_DAYS_BEFORE':
      return {
        title: 'Payment due in 2 days',
        body: `Invoice #${invoiceNum} for ${formattedAmount} from ${customerName} is due in 2 days.`,
      };
    case 'DUE_DATE':
      return {
        title: 'Payment due today',
        body: `Invoice #${invoiceNum} for ${formattedAmount} from ${customerName} is due today. Contact your client about the payment.`,
      };
    case '1_DAY_AFTER':
      return {
        title: 'Payment overdue',
        body: `Invoice #${invoiceNum} for ${formattedAmount} from ${customerName} is 1 day overdue. Follow up with your client.`,
      };
    case '3_DAYS_AFTER':
      return {
        title: 'Payment 3 days overdue',
        body: `Invoice #${invoiceNum} for ${formattedAmount} from ${customerName} is still unpaid.`,
      };
    case '7_DAYS_AFTER':
      return {
        title: 'Payment 7 days overdue',
        body: `Invoice #${invoiceNum} for ${formattedAmount} from ${customerName} is still unpaid. Consider contacting your client.`,
      };
  }
}

async function buildNotificationContent(
  invoice: Invoice,
  type: PaymentReminderType,
): Promise<Notifications.NotificationContentInput> {
  const { title, body } = buildPaymentReminderContentInput(invoice, type);

  const content: Notifications.NotificationContentInput = {
    title,
    body,
    data: {
      type: PAYMENT_REMINDER_DATA_TYPE,
      invoiceId: invoice.id,
      reminderType: type,
      customerPhone: invoice.customer.phone ?? '',
    },
    categoryIdentifier: PAYMENT_REMINDER_CATEGORY_ID,
    sound: true,
    color: '#FFFFFF',
    ...(Platform.OS === 'android' ? { channelId: PAYMENT_REMINDER_CHANNEL_ID } : {}),
  };

  if (Platform.OS === 'ios') {
    try {
      const asset = Asset.fromModule(require('../../../../assets/images/invoice-base-icon.png'));
      await asset.downloadAsync();
      if (asset.localUri != null) {
        content.attachments = [
          {
            identifier: `payment-reminder-logo-${type}`,
            url: asset.localUri,
            type: 'png',
          },
        ];
      }
    } catch (error) {
      recordError(error, 'PaymentReminderLogoAttachFailed');
    }
  }

  return content;
}

export async function syncPaymentRemindersForInvoice(invoiceId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  await cancelPaymentRemindersForInvoice(invoiceId);

  const preferences = useUserPreferencesStore.getState();
  if (!preferences.paymentReminderSettings.enabled) return;

  const permission = await getNotificationPermissionStatus();
  if (!permission.granted) return;

  const invoice = invoiceRepository.getById(invoiceId);
  if (invoice == null) return;

  if (
    invoice.status === InvoiceStatus.Draft ||
    invoice.status === InvoiceStatus.Paid ||
    invoice.status === InvoiceStatus.Cancelled
  ) {
    return;
  }

  if (invoice.dueAt == null || invoice.dueAt.trim().length === 0) return;

  await ensurePaymentReminderCategoryAndChannel();

  const now = Date.now();
  const enabledTypes = preferences.paymentReminderSettings.enabledTypes;

  for (const type of ALL_REMINDER_TYPES) {
    if (!enabledTypes[type]) continue;

    const triggerDate = calculateReminderTriggerDate(invoice.dueAt, type);
    if (triggerDate == null || triggerDate.getTime() <= now) continue;

    try {
      const notificationContent = await buildNotificationContent(invoice, type);
      await Notifications.scheduleNotificationAsync({
        identifier: getPaymentReminderId(invoiceId, type),
        content: notificationContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    } catch (error) {
      recordError(error, `SchedulePaymentReminder_${type}_Failed`);
    }
  }
}

export async function syncPaymentRemindersForAllInvoices(): Promise<void> {
  if (Platform.OS === 'web') return;

  const preferences = useUserPreferencesStore.getState();
  if (!preferences.paymentReminderSettings.enabled) {
    await cancelAllPaymentReminders();
    return;
  }

  const permission = await getNotificationPermissionStatus();
  if (!permission.granted) {
    await cancelAllPaymentReminders();
    return;
  }

  const invoices = invoiceRepository.getAll();
  for (const invoice of invoices) {
    await syncPaymentRemindersForInvoice(invoice.id);
  }
}

export function subscribeToPaymentReminderActions(
  onNavigateToInvoice: (invoiceId: string) => void,
): () => void {
  if (Platform.OS === 'web') return () => undefined;

  const handleResponse = (response: Notifications.NotificationResponse | null): void => {
    if (response == null) return;
    const content = response.notification.request.content;
    if (content.data?.type !== PAYMENT_REMINDER_DATA_TYPE) return;

    const responseKey = `${response.notification.request.identifier}:${String(response.notification.date)}`;
    if (lastHandledResponseKey === responseKey) return;
    lastHandledResponseKey = responseKey;

    const actionIdentifier = response.actionIdentifier;
    const invoiceId = content.data?.invoiceId as string | undefined;
    const customerPhone = content.data?.customerPhone as string | undefined;

    if (actionIdentifier === PAYMENT_REMINDER_ACTION_CALL_CLIENT) {
      if (typeof customerPhone === 'string' && customerPhone.trim().length > 0) {
        const phoneUrl = `tel:${customerPhone.trim()}`;
        Linking.canOpenURL(phoneUrl)
          .then((supported) => {
            if (supported) {
              return Linking.openURL(phoneUrl);
            } else {
              showToast('error', { title: 'Phone dialer is not supported on this device.' });
            }
          })
          .catch((error) => recordError(error, 'OpenPhoneDialerFailed'));
      } else {
        showToast('error', { title: 'No phone number available for this client.' });
      }
      return;
    }

    if (invoiceId != null && invoiceId.length > 0) {
      onNavigateToInvoice(invoiceId);
    }
  };

  const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
  void Notifications.getLastNotificationResponseAsync()
    .then(handleResponse)
    .catch((error) => {
      recordError(error, 'LastPaymentReminderResponseFailed');
    });

  return () => {
    subscription.remove();
  };
}

import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Linking, Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { Modal } from '@/components/feedback/Modal';
import { showToast } from '@/components/feedback/Toast';
import { Switch } from '@/components/form/Switch';
import { Header } from '@/components/layout/Header';
import { ThemedText } from '@/components/themed-text';
import {
  DEV_REWARDED_INVOICE_CREDIT,
  INVOICE_CREDITS_QUERY_KEY,
  invoiceCreditFeatureRepository,
} from '@/features/credits';
import { invoiceFeatureRepository } from '@/features/invoice/repositories/InvoiceRepository';
import { getCurrencyOptions } from '@/features/preferences/catalog';
import { SearchablePickerModal } from '@/features/preferences/components/SearchablePickerModal';
import { ROUTES } from '@/navigation';
import { queryClient } from '@/providers/query-client';
import {
  BackupSaveError,
  BackupShareError,
  BackupUserCancelledError,
  exportBackup,
  saveBackupToDevice,
  shareBackup,
  type CreatedBackupFile,
} from '@/services/backup';
import {
  cancelAutoBackupReminder,
  disableAutoBackupReminder,
  enableAutoBackupReminder,
  getNotificationPermissionStatus,
  openNotificationSettings,
  sendTestAutoBackupReminder,
} from '@/services/notifications';
import { useUserPreferencesStore } from '@/stores/user-preferences';
import { cStyle, useTheme, type ThemePreference } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { SettingsRow } from '../components/SettingsRow';
import { SettingsSection } from '../components/SettingsSection';
import { getAppVersion } from '../utils/app-version';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const BACKUP_REMINDER_DESCRIPTION = 'Get reminded to create a backup of your data.';
const NOTIFICATIONS_DISABLED_TITLE = 'Notifications are disabled';
const NOTIFICATIONS_DISABLED_MESSAGE =
  'Easy Invoice Maker needs notification permission to remind you about backups. You can enable notifications from your device settings.';

function themePreferenceLabel(preference: ThemePreference): string {
  if (preference === 'system') return 'System';
  if (preference === 'dark') return 'Dark';
  return 'Light';
}

function currencyDisplayLabel(currencyCode: string): string {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
    }).formatToParts(0);
    const symbol = parts.find((part) => part.type === 'currency')?.value ?? currencyCode;
    return `${currencyCode} (${symbol})`;
  } catch {
    return currencyCode;
  }
}

export function SettingsScreen() {
  const router = useRouter();
  const { theme, preference, setThemePreference } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showNotificationSettingsHelp, setShowNotificationSettingsHelp] = useState(false);
  const [isUpdatingReminder, setIsUpdatingReminder] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [backupReadyFile, setBackupReadyFile] = useState<CreatedBackupFile | null>(null);
  const [backupAction, setBackupAction] = useState<'save' | 'share' | null>(null);

  const currencyCode = useUserPreferencesStore((state) => state.currencyCode);
  const setCurrencyCode = useUserPreferencesStore((state) => state.setCurrencyCode);
  const resetOnboarding = useUserPreferencesStore((state) => state.resetOnboarding);
  const autoBackupReminderEnabled = useUserPreferencesStore(
    (state) => state.autoBackupReminderEnabled,
  );
  const appVersion = getAppVersion();
  const [invoiceNumberPreview, setInvoiceNumberPreview] = useState(
    () => invoiceFeatureRepository.getInvoiceNumberFormat().nextAvailableNumber,
  );

  const refreshNotificationPermission = useCallback(async () => {
    const status = await getNotificationPermissionStatus();
    setNotificationPermissionGranted(status.granted);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setInvoiceNumberPreview(
        invoiceFeatureRepository.getInvoiceNumberFormat().nextAvailableNumber,
      );
      void refreshNotificationPermission();
    }, [refreshNotificationPermission]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshNotificationPermission();
      }
    });
    return () => subscription.remove();
  }, [refreshNotificationPermission]);

  const closeBackupReady = useCallback(() => {
    if (backupAction != null) return;
    setBackupReadyFile(null);
  }, [backupAction]);

  const handleExportBackup = useCallback(async () => {
    if (isExportingBackup) return;
    setIsExportingBackup(true);
    try {
      const backupFile = await exportBackup();
      setBackupReadyFile(backupFile);
    } catch {
      showToast('error', {
        title: 'Unable to export backup. Please try again.',
      });
    } finally {
      setIsExportingBackup(false);
    }
  }, [isExportingBackup]);

  const handleSaveBackup = useCallback(async () => {
    if (backupReadyFile == null || backupAction != null) return;
    setBackupAction('save');
    try {
      await saveBackupToDevice(backupReadyFile.uri, backupReadyFile.fileName);
      setBackupReadyFile(null);
      showToast('success', { title: 'Backup saved successfully' });
    } catch (error) {
      if (error instanceof BackupUserCancelledError) return;
      showToast('error', {
        title:
          error instanceof BackupSaveError
            ? error.message
            : 'Unable to save backup. Please try again.',
      });
    } finally {
      setBackupAction(null);
    }
  }, [backupAction, backupReadyFile]);

  const handleShareBackup = useCallback(async () => {
    if (backupReadyFile == null || backupAction != null) return;
    setBackupAction('share');
    try {
      await shareBackup(backupReadyFile.uri);
      setBackupReadyFile(null);
    } catch (error) {
      if (error instanceof BackupUserCancelledError) return;
      showToast('error', {
        title:
          error instanceof BackupShareError
            ? error.message
            : 'Unable to share backup. Please try again.',
      });
    } finally {
      setBackupAction(null);
    }
  }, [backupAction, backupReadyFile]);

  const currencyItems = useMemo(
    () =>
      getCurrencyOptions().map((currency) => ({
        id: currency.code,
        title: `${currency.symbol}  ${currency.code} — ${currency.name}`,
      })),
    [],
  );

  const reminderSwitchValue = notificationPermissionGranted ? autoBackupReminderEnabled : false;

  const handleAutoBackupReminderChange = useCallback(
    async (nextEnabled: boolean) => {
      if (isUpdatingReminder) return;
      setIsUpdatingReminder(true);
      try {
        if (!nextEnabled) {
          await disableAutoBackupReminder();
          await refreshNotificationPermission();
          return;
        }

        const result = await enableAutoBackupReminder();
        await refreshNotificationPermission();

        if (result.outcome === 'enabled') {
          return;
        }
        if (result.outcome === 'blocked' || result.outcome === 'denied') {
          setShowNotificationSettingsHelp(true);
          return;
        }
        showToast('error', {
          title: 'Unable to enable backup reminder. Please try again.',
        });
      } finally {
        setIsUpdatingReminder(false);
      }
    },
    [isUpdatingReminder, refreshNotificationPermission],
  );

  const handleSendFeedbackPress = async () => {
    await Linking.openURL('https://tally.so/r/D4RZrp');
  };
  const handlePrivacyPress = async () => {
    await Linking.openURL(
      'https://rachivinfotech.pages.dev/apps/easy-invoice-maker/privacy-policy',
    );
  };

  const leadingIcon = (name: keyof typeof Ionicons.glyphMap) => (
    <View style={[cStyle.p8, cStyle.r12, { backgroundColor: theme.colors.backgroundSubtle }]}>
      <Ionicons name={name} size={theme.iconSizes.md} color={theme.colors.primary} />
    </View>
  );

  const premiumIcon = (
    <View style={[cStyle.p8, cStyle.r12, { backgroundColor: theme.colors.premiumSubtle }]}>
      <Ionicons name="star" size={theme.iconSizes.md} color={theme.colors.premium} />
    </View>
  );

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header title="Settings" />

      <ScrollView
        contentContainerStyle={{
          gap: cStyleValues.spacing.xl,
          paddingHorizontal: cStyleValues.spacing.lg,
          paddingBottom: cStyleValues.spacing['3xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Business">
          <SettingsRow
            label="Business Profile"
            leading={leadingIcon('business-outline')}
            onPress={() => router.push(ROUTES.businessProfile)}
            accessibilityHint="Opens business profile settings"
          />
          <SettingsRow
            label="Invoice Templates"
            leading={leadingIcon('document-text-outline')}
            onPress={() => router.push(ROUTES.invoiceTemplates)}
            accessibilityHint="Opens invoice templates"
          />
          <SettingsRow
            label="Invoice Number Format"
            value={invoiceNumberPreview}
            leading={leadingIcon('pricetag-outline')}
            onPress={() => router.push(ROUTES.invoiceNumberFormat)}
            accessibilityHint="Opens invoice number format settings"
          />
          <SettingsRow
            label="Currency"
            value={currencyCode == null ? 'Not set' : currencyDisplayLabel(currencyCode)}
            leading={leadingIcon('cash-outline')}
            onPress={() => setShowCurrencyPicker(true)}
            accessibilityHint="Opens the currency picker"
          />
          <SettingsRow
            label="Tax Settings"
            leading={leadingIcon('calculator-outline')}
            divider={false}
            onPress={() => router.push(ROUTES.taxSettings)}
            accessibilityHint="Opens tax settings"
          />
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingsRow
            label="Theme"
            value={themePreferenceLabel(preference)}
            leading={leadingIcon('color-palette-outline')}
            onPress={() => setShowThemePicker(true)}
            accessibilityHint="Choose light, dark, or system theme"
          />
        </SettingsSection>

        {__DEV__ && (
          <SettingsSection title="Premium">
            <SettingsRow
              label="Go Premium ⭐"
              tone="premium"
              leading={premiumIcon}
              onPress={() => router.push(ROUTES.premium)}
              accessibilityHint="Opens the premium screen"
            />
          </SettingsSection>
        )}

        <SettingsSection title="Data & Backup">
          <SettingsRow
            label={isExportingBackup ? 'Creating backup...' : 'Export Backup'}
            leading={leadingIcon('cloud-upload-outline')}
            disabled={isExportingBackup}
            onPress={handleExportBackup}
            accessibilityHint="Creates a JSON backup of your business data"
          />
          <SettingsRow
            label="Import Backup"
            leading={leadingIcon('cloud-download-outline')}
            onPress={() => router.push(ROUTES.backupRestore)}
            accessibilityHint="Opens import backup to restore data from a JSON file"
          />
          <SettingsRow
            label="Auto Backup Reminder"
            description={BACKUP_REMINDER_DESCRIPTION}
            leading={leadingIcon('alarm-outline')}
            trailing={
              <Switch
                accessibilityLabel="Auto Backup Reminder"
                accessibilityHint={BACKUP_REMINDER_DESCRIPTION}
                value={reminderSwitchValue}
                onValueChange={(nextEnabled) => {
                  void handleAutoBackupReminderChange(nextEnabled);
                }}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsRow
            label="Privacy Policy"
            leading={leadingIcon('shield-checkmark-outline')}
            onPress={() => handlePrivacyPress()}
          />
          <SettingsRow
            label="Send Feedback"
            leading={leadingIcon('chatbox-outline')}
            divider={false}
            onPress={() => handleSendFeedbackPress()}
            accessibilityHint="Opens the feedback form"
          />
        </SettingsSection>

        {__DEV__ && (
          <SettingsSection title="Developer">
            <SettingsRow
              label={`Add ${DEV_REWARDED_INVOICE_CREDIT} invoice credits`}
              leading={leadingIcon('add-circle-outline')}
              onPress={() => {
                invoiceCreditFeatureRepository.addPurchasedCredits(DEV_REWARDED_INVOICE_CREDIT);
                void queryClient.invalidateQueries({ queryKey: INVOICE_CREDITS_QUERY_KEY });
                showToast('success', {
                  title: `Added ${DEV_REWARDED_INVOICE_CREDIT} invoice credits`,
                });
              }}
              accessibilityHint="Adds purchased invoice credits for local testing"
            />
            <SettingsRow
              label="Send test backup reminder"
              leading={leadingIcon('notifications-outline')}
              onPress={() => {
                void (async () => {
                  const sent = await sendTestAutoBackupReminder();
                  showToast(sent ? 'success' : 'error', {
                    title: sent
                      ? 'Test backup reminder sent'
                      : 'Allow notifications to send a test reminder.',
                  });
                })();
              }}
              accessibilityHint="Shows the backup reminder notification immediately for testing"
            />
            <SettingsRow
              label="Reset onboarding"
              leading={leadingIcon('refresh-outline')}
              divider={false}
              onPress={() => {
                void cancelAutoBackupReminder();
                resetOnboarding();
                queryClient.clear();
                router.replace(ROUTES.onboarding);
              }}
              accessibilityHint="Clears onboarding, business profile, customers, products, and invoices for testing"
            />
          </SettingsSection>
        )}

        <SettingsSection title="Others">
          {__DEV__ && (
            <SettingsRow
              label="Terms"
              leading={leadingIcon('document-outline')}
              onPress={() => router.push(ROUTES.termsOfService)}
            />
          )}
          <SettingsRow
            label="Rate App"
            leading={leadingIcon('star-outline')}
            onPress={() => {
              showToast('info', {
                title: 'Rate App',
                message: 'Store rating will be available in a future update.',
              });
            }}
            accessibilityHint="Store rating is not available yet"
          />
          <SettingsRow
            label="Share App"
            leading={leadingIcon('share-social-outline')}
            divider={false}
            onPress={() => {
              showToast('info', {
                title: 'Share App',
                message: 'Sharing will be available in a future update.',
              });
              // void Share.share({
              //   message: 'Check out Invoicely — create professional invoices offline.',
              // }).catch(() => {
              //   showToast('info', {
              //     title: 'Share unavailable',
              //     message: 'Sharing is not available on this device.',
              //   });
              // });
            }}
            accessibilityHint="Opens the system share sheet"
          />
        </SettingsSection>

        <ThemedText
          style={[theme.typography.helper, cStyle.textCenter, { color: theme.colors.textTertiary }]}
          accessibilityLabel={`Version ${appVersion}`}
        >
          Version {appVersion}
        </ThemedText>
      </ScrollView>

      <Modal
        visible={showNotificationSettingsHelp}
        title={NOTIFICATIONS_DISABLED_TITLE}
        description={NOTIFICATIONS_DISABLED_MESSAGE}
        onRequestClose={() => setShowNotificationSettingsHelp(false)}
        primaryAction={{
          label: 'Open Settings',
          onPress: () => {
            setShowNotificationSettingsHelp(false);
            void openNotificationSettings();
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setShowNotificationSettingsHelp(false),
        }}
      />

      <Modal
        visible={backupReadyFile != null}
        title="Backup Ready"
        description="Your backup has been created successfully. Choose what you want to do with it."
        closable={backupAction == null}
        onRequestClose={closeBackupReady}
        footer={
          <View style={[cStyle.g8]}>
            <Button
              label="Save to Device"
              loading={backupAction === 'save'}
              disabled={backupAction != null}
              onPress={() => {
                void handleSaveBackup();
              }}
            />
            <Button
              label="Share Backup"
              variant="outline"
              loading={backupAction === 'share'}
              disabled={backupAction != null}
              onPress={() => {
                void handleShareBackup();
              }}
            />
            <Button
              label="Cancel"
              variant="ghost"
              disabled={backupAction != null}
              onPress={closeBackupReady}
            />
          </View>
        }
      />

      <SearchablePickerModal
        visible={showCurrencyPicker}
        title="Select currency"
        searchPlaceholder="Search currency..."
        items={currencyItems}
        selectedId={currencyCode}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={(code) => {
          try {
            setCurrencyCode(code);
            showToast('success', { title: 'Currency updated' });
          } catch {
            showToast('error', {
              title: 'Could not save currency',
              message: 'Please try again.',
            });
          }
        }}
      />

      <Modal
        visible={showThemePicker}
        title="Theme"
        description="Choose how Invoicely should look."
        onRequestClose={() => setShowThemePicker(false)}
        footer={
          <View style={[cStyle.g8]}>
            {THEME_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: preference === option.value }}
                accessibilityLabel={`${option.label} theme`}
                onPress={() => {
                  setThemePreference(option.value);
                  setShowThemePicker(false);
                }}
                style={[
                  cStyle.ph16,
                  cStyle.pv12,
                  cStyle.r12,
                  {
                    backgroundColor:
                      preference === option.value
                        ? theme.colors.primarySubtle
                        : theme.colors.backgroundSubtle,
                    minHeight: theme.buttons.sizes.md.minHeight,
                    justifyContent: 'center',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    theme.typography.bodyMedium,
                    {
                      color:
                        preference === option.value
                          ? theme.colors.primary
                          : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        }
      />
    </View>
  );
}

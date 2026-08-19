import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';

import { Modal } from '@/components/feedback/Modal';
import { showToast } from '@/components/feedback/Toast';
import { Switch } from '@/components/form/Switch';
import { IconButton } from '@/components/IconButton';
import { Header } from '@/components/layout/Header';
import { ThemedText } from '@/components/themed-text';
import { invoiceFeatureRepository } from '@/features/invoice/repositories/InvoiceRepository';
import { ROUTES } from '@/navigation';
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
  const [autoBackupReminder, setAutoBackupReminder] = useState(true);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const currencyCode = useUserPreferencesStore((state) => state.currencyCode);
  const resetOnboarding = useUserPreferencesStore((state) => state.resetOnboarding);
  const appVersion = getAppVersion();
  const invoiceNumberPreview =
    invoiceFeatureRepository.getInvoiceNumberFormat().nextAvailableNumber;

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
      <Header
        title="Settings"
        rightActions={
          <IconButton
            icon={({ color, size }) => (
              <Ionicons name="notifications-outline" color={color} size={size} />
            )}
            accessibilityLabel="View notifications"
            onPress={() => undefined}
          />
        }
      />

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
            onPress={() => router.push(ROUTES.currencySettings)}
            accessibilityHint="Opens currency settings"
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

        <SettingsSection title="Premium">
          <SettingsRow
            label="Go Premium ⭐"
            tone="premium"
            leading={premiumIcon}
            onPress={() => router.push(ROUTES.premium)}
            accessibilityHint="Opens the premium screen"
          />
        </SettingsSection>

        <SettingsSection title="Data & Backup">
          <SettingsRow
            label="Export Backup"
            leading={leadingIcon('cloud-upload-outline')}
            onPress={() => router.push(ROUTES.backupRestore)}
            accessibilityHint="Opens backup and restore"
          />
          <SettingsRow
            label="Import Backup"
            leading={leadingIcon('cloud-download-outline')}
            onPress={() => router.push(ROUTES.backupRestore)}
            accessibilityHint="Opens backup and restore"
          />
          <SettingsRow
            label="Auto Backup Reminder"
            leading={leadingIcon('alarm-outline')}
            trailing={
              <Switch
                accessibilityLabel="Auto backup reminder"
                value={autoBackupReminder}
                onValueChange={setAutoBackupReminder}
              />
            }
            accessibilityLabel="Auto Backup Reminder"
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsRow
            label="Privacy Policy"
            leading={leadingIcon('shield-checkmark-outline')}
            onPress={() => router.push(ROUTES.privacyPolicy)}
          />
          <SettingsRow
            label="Send Feedback"
            leading={leadingIcon('chatbox-outline')}
            divider={false}
            onPress={() => undefined}
            accessibilityHint="Opens the feedback form"
          />
        </SettingsSection>

        {__DEV__ && (
          <SettingsSection title="Developer">
            <SettingsRow
              label="Reset onboarding"
              leading={leadingIcon('refresh-outline')}
              divider={false}
              onPress={() => {
                resetOnboarding();
                router.replace(ROUTES.onboarding);
              }}
              accessibilityHint="Clears country, currency, and onboarding completion for testing"
            />
          </SettingsSection>
        )}

        <SettingsSection title="Others">
          <SettingsRow
            label="Terms"
            leading={leadingIcon('document-outline')}
            onPress={() => router.push(ROUTES.termsOfService)}
          />
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
              void Share.share({
                message: 'Check out Invoicely — create professional invoices offline.',
              }).catch(() => {
                showToast('info', {
                  title: 'Share unavailable',
                  message: 'Sharing is not available on this device.',
                });
              });
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

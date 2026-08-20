import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Modal } from '@/components/feedback/Modal';
import { showToast } from '@/components/feedback/Toast';
import { Header } from '@/components/layout/Header';
import { ListItem } from '@/components/layout/ListItem';
import { ThemedText } from '@/components/themed-text';
import { BUSINESS_QUERY_KEY } from '@/features/business/hooks/useBusiness';
import { INVOICES_QUERY_KEY } from '@/features/invoice/hooks/useInvoices';
import { formatCountryLabel } from '@/features/preferences/catalog';
import { PRODUCTS_QUERY_KEY } from '@/features/product/hooks/useProducts';
import {
  BackupInvalidError,
  BackupReadError,
  BackupRestoreError,
  BackupUnsupportedVersionError,
  BackupUserCancelledError,
  restoreValidatedBackup,
  selectAndInspectBackup,
  type BackupImportPreview,
  type BackupImportStage,
} from '@/services/backup';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

function currencyDisplayLabel(currencyCode: string | null): string {
  if (currencyCode == null || currencyCode.length === 0) return 'Not set';
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

function countryDisplayLabel(countryCode: string | null, hasCountrySettings: boolean): string {
  if (!hasCountrySettings) return 'Not in backup';
  if (countryCode == null || countryCode.length === 0) return 'Not set';
  try {
    return formatCountryLabel(countryCode);
  } catch {
    return countryCode;
  }
}

function availabilityLabel(available: boolean): string {
  return available ? 'Available' : 'Not in backup';
}

type BackupDetailRow = {
  key: string;
  label: string;
  value: string;
};

function buildBackupDetailRows(preview: BackupImportPreview): BackupDetailRow[] {
  return [
    { key: 'created', label: 'Created', value: preview.createdAtLabel },
    { key: 'appVersion', label: 'App version', value: preview.appVersion },
    { key: 'customers', label: 'Customers', value: String(preview.customerCount) },
    { key: 'products', label: 'Products', value: String(preview.productCount) },
    { key: 'invoices', label: 'Invoices', value: String(preview.invoiceCount) },
    { key: 'currency', label: 'Currency', value: currencyDisplayLabel(preview.currencyCode) },
    {
      key: 'country',
      label: 'Country',
      value: countryDisplayLabel(preview.countryCode, preview.hasCountrySettings),
    },
    {
      key: 'business',
      label: 'Business Profile',
      value: availabilityLabel(preview.hasBusinessProfile),
    },
    {
      key: 'invoiceNumber',
      label: 'Invoice Number Format',
      value: availabilityLabel(preview.hasInvoiceNumberFormat),
    },
    {
      key: 'tax',
      label: 'Tax Settings',
      value: availabilityLabel(preview.hasTaxSettings),
    },
  ];
}

function importStageLabel(stage: BackupImportStage): string {
  if (stage === 'selecting') return 'Selecting file...';
  if (stage === 'reading') return 'Reading backup...';
  if (stage === 'validating') return 'Validating backup...';
  return 'Restoring backup...';
}

export function BackupRestoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const [stage, setStage] = useState<BackupImportStage | null>(null);
  const [preview, setPreview] = useState<BackupImportPreview | null>(null);
  const [showDestructiveConfirm, setShowDestructiveConfirm] = useState(false);

  const isBusy = stage != null;
  const backupDetailRows = useMemo(
    () => (preview == null ? [] : buildBackupDetailRows(preview)),
    [preview],
  );
  const modalMaxHeight = windowHeight * 0.9;

  const closePreview = useCallback(() => {
    if (isBusy) return;
    setPreview(null);
    setShowDestructiveConfirm(false);
  }, [isBusy]);

  const handleSelectBackup = useCallback(async () => {
    if (isBusy) return;
    try {
      const inspected = await selectAndInspectBackup(setStage);
      setPreview(inspected);
    } catch (error) {
      if (error instanceof BackupUserCancelledError) return;
      if (error instanceof BackupUnsupportedVersionError) {
        showToast('error', { title: error.message });
        return;
      }
      if (error instanceof BackupReadError) {
        showToast('error', { title: error.message });
        return;
      }
      showToast('error', {
        title:
          error instanceof BackupInvalidError
            ? error.message
            : 'Selected file is not a valid Easy Invoice Maker backup.',
      });
    } finally {
      setStage(null);
    }
  }, [isBusy]);

  const handleRestoreBackup = useCallback(async () => {
    if (preview == null || stage === 'restoring') return;
    setStage('restoring');
    try {
      await restoreValidatedBackup(preview.backup);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      setShowDestructiveConfirm(false);
      setPreview(null);
      showToast('success', { title: 'Backup restored successfully' });
      router.back();
    } catch (error) {
      if (error instanceof BackupUserCancelledError) return;
      showToast('error', {
        title:
          error instanceof BackupRestoreError
            ? error.message
            : 'Unable to restore backup. Your data was not changed.',
      });
    } finally {
      setStage(null);
    }
  }, [preview, queryClient, router, stage]);

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header title="Import Backup" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          gap: cStyleValues.spacing.xl,
          padding: cStyleValues.spacing.lg,
          paddingBottom: insets.bottom + cStyleValues.spacing['3xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
          Restore a backup created by Easy Invoice Maker. This replaces your current business
          profile, customers, products, invoices, and invoice settings.
        </ThemedText>
        <Button
          label={stage == null ? 'Select Backup File' : importStageLabel(stage)}
          loading={isBusy}
          disabled={isBusy}
          onPress={() => {
            void handleSelectBackup();
          }}
        />
      </ScrollView>

      <Modal
        visible={preview != null && !showDestructiveConfirm}
        title="Backup details"
        description="Review this backup before replacing your current data."
        size="lg"
        closable={!isBusy}
        onRequestClose={closePreview}
        contentStyle={{ maxHeight: modalMaxHeight }}
        footer={
          <View style={[cStyle.g8]}>
            <Button
              label="Restore Backup"
              disabled={isBusy}
              onPress={() => setShowDestructiveConfirm(true)}
            />
            <Button label="Cancel" variant="ghost" disabled={isBusy} onPress={closePreview} />
          </View>
        }
      >
        <FlatList
          data={backupDetailRows}
          keyExtractor={(item) => item.key}
          style={{ maxHeight: windowHeight * 0.52 }}
          nestedScrollEnabled
          scrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          renderItem={({ item, index }) => (
            <ListItem
              title={item.label}
              titleNumberOfLines={1}
              divider={
                index < backupDetailRows.length - 1 || preview?.skippedBusinessAssets === true
              }
              trailing={
                <ThemedText
                  numberOfLines={1}
                  style={[
                    theme.typography.helper,
                    { color: theme.colors.textSecondary, maxWidth: 140 },
                  ]}
                >
                  {item.value}
                </ThemedText>
              }
            />
          )}
          ListFooterComponent={
            preview?.skippedBusinessAssets === true ? (
              <ThemedText
                style={[
                  theme.typography.helper,
                  cStyle.ph16,
                  cStyle.pv12,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Logo or signature files from this backup were not found on this device and will not
                be restored.
              </ThemedText>
            ) : null
          }
        />
      </Modal>

      <Modal
        visible={showDestructiveConfirm}
        title="Restore Backup?"
        description="This will replace your current business profile, customers, products, invoices, and invoice settings with the data from this backup. Your current data may be overwritten. Continue only if you are sure you want to restore this backup."
        variant="destructive"
        closable={stage !== 'restoring'}
        onRequestClose={() => {
          if (stage === 'restoring') return;
          setShowDestructiveConfirm(false);
        }}
        primaryAction={{
          label: stage === 'restoring' ? 'Restoring backup...' : 'Restore Backup',
          loading: stage === 'restoring',
          disabled: stage === 'restoring',
          onPress: () => {
            void handleRestoreBackup();
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          disabled: stage === 'restoring',
          onPress: () => setShowDestructiveConfirm(false),
        }}
      />
    </View>
  );
}

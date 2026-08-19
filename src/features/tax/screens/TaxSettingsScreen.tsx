import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/feedback/Modal';
import { showToast } from '@/components/feedback/Toast';
import { Switch } from '@/components/form/Switch';
import { Card } from '@/components/layout/Card';
import { Header } from '@/components/layout/Header';
import { ThemedText } from '@/components/themed-text';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import {
  TaxDuplicateError,
  TaxNotFoundError,
  taxSettingsRepository,
} from '@/features/tax/repositories/TaxSettingsRepository';
import { formatSavedTaxLabel, formatTaxPercent } from '@/features/tax/utils/tax.utils';
import { ROUTES } from '@/navigation';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';
import type { SavedTaxRate, TaxCatalogSettings } from '@/types/models';

export function TaxSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [catalog, setCatalog] = useState<TaxCatalogSettings>(() =>
    taxSettingsRepository.getCatalog(),
  );
  const [taxPendingDelete, setTaxPendingDelete] = useState<SavedTaxRate | null>(null);

  useFocusEffect(
    useCallback(() => {
      setCatalog(taxSettingsRepository.getCatalog());
    }, []),
  );

  const refresh = () => setCatalog(taxSettingsRepository.getCatalog());

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header title="Tax Settings" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: cStyleValues.spacing.lg,
          paddingBottom: cStyleValues.spacing.lg + insets.bottom,
          gap: cStyleValues.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>
          Configure taxes used on your invoices. Changing these settings does not update existing
          invoices.
        </ThemedText>

        <SettingsSection title="Tax">
          <SettingsRow
            label="Enable Tax"
            divider={false}
            trailing={
              <Switch
                accessibilityLabel="Enable tax"
                value={catalog.enabled}
                onValueChange={(enabled) => {
                  setCatalog(taxSettingsRepository.setEnabled(enabled));
                }}
              />
            }
            accessibilityLabel="Enable Tax"
          />
        </SettingsSection>

        <View style={[cStyle.g12]}>
          <ThemedText
            style={[
              theme.typography.caption,
              cStyle.fontSemiBold,
              {
                color: theme.colors.textSecondary,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              },
            ]}
          >
            Saved Taxes
          </ThemedText>

          {catalog.taxes.length === 0 ? (
            <EmptyState
              title="No taxes configured"
              description="Add a tax to apply taxes to your invoices."
            />
          ) : (
            catalog.taxes.map((tax) => {
              const isDefault = catalog.defaultTaxId === tax.id;
              return (
                <Card key={tax.id} variant="outlined">
                  <View style={[cStyle.flexRow, cStyle.justifyBetween, cStyle.itemStart]}>
                    <View style={[cStyle.flex1, cStyle.g4]}>
                      <ThemedText
                        style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
                      >
                        {tax.name}
                      </ThemedText>
                      <ThemedText
                        style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                      >
                        {formatTaxPercent(tax.rateBasisPoints)}%
                      </ThemedText>
                      {isDefault ? (
                        <ThemedText
                          style={[theme.typography.label, { color: theme.colors.primary }]}
                        >
                          Default
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                  <View style={[cStyle.flexRow, cStyle.g16, cStyle.mt8]}>
                    <Pressable
                      onPress={() => router.push(ROUTES.taxForm(tax.id))}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${formatSavedTaxLabel(tax)}`}
                      style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g4]}
                    >
                      <Ionicons
                        name="create-outline"
                        size={theme.iconSizes.sm}
                        color={theme.colors.primary}
                      />
                      <ThemedText style={[theme.typography.label, { color: theme.colors.primary }]}>
                        Edit
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        try {
                          setCatalog(
                            taxSettingsRepository.setDefaultTaxId(isDefault ? undefined : tax.id),
                          );
                        } catch (error) {
                          if (error instanceof TaxNotFoundError) {
                            showToast('error', { title: 'Tax not found' });
                            refresh();
                          }
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isDefault ? `Remove default from ${tax.name}` : `Set ${tax.name} as default`
                      }
                      style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g4]}
                    >
                      <Ionicons
                        name={isDefault ? 'star' : 'star-outline'}
                        size={theme.iconSizes.sm}
                        color={theme.colors.primary}
                      />
                      <ThemedText style={[theme.typography.label, { color: theme.colors.primary }]}>
                        {isDefault ? 'Default' : 'Set default'}
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => setTaxPendingDelete(tax)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${formatSavedTaxLabel(tax)}`}
                      style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g4]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={theme.iconSizes.sm}
                        color={theme.colors.danger}
                      />
                      <ThemedText style={[theme.typography.label, { color: theme.colors.danger }]}>
                        Delete
                      </ThemedText>
                    </Pressable>
                  </View>
                </Card>
              );
            })
          )}

          <Button
            label="Add Tax"
            variant="outline"
            leftIcon={({ color, size }) => <Ionicons name="add" color={color} size={size} />}
            onPress={() => router.push(ROUTES.taxForm())}
          />
        </View>
      </ScrollView>

      <Modal
        visible={taxPendingDelete != null}
        variant="destructive"
        title={
          taxPendingDelete == null
            ? 'Delete tax'
            : `Delete ${formatSavedTaxLabel(taxPendingDelete)}?`
        }
        description="This tax will no longer be available for new invoices. Existing invoices using this tax will not be affected."
        onRequestClose={() => setTaxPendingDelete(null)}
        secondaryAction={{ label: 'Cancel', onPress: () => setTaxPendingDelete(null) }}
        primaryAction={{
          label: 'Delete',
          onPress: () => {
            if (taxPendingDelete == null) return;
            try {
              setCatalog(taxSettingsRepository.deleteTax(taxPendingDelete.id));
              setTaxPendingDelete(null);
              showToast('success', { title: 'Tax deleted' });
            } catch (error) {
              if (error instanceof TaxDuplicateError) {
                showToast('error', { title: error.message });
                return;
              }
              showToast('error', { title: 'Could not delete tax' });
            }
          },
        }}
      />
    </View>
  );
}

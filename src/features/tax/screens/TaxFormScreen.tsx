import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { showToast } from '@/components/feedback/Toast';
import { Checkbox } from '@/components/form/Checkbox';
import { Input } from '@/components/form/Input';
import { Card } from '@/components/layout/Card';
import { Header } from '@/components/layout/Header';
import { ThemedText } from '@/components/themed-text';
import {
  TaxDuplicateError,
  TaxNotFoundError,
  taxSettingsRepository,
} from '@/features/tax/repositories/TaxSettingsRepository';
import { formatSavedTaxLabel, parseTaxPercentToBasisPoints } from '@/features/tax/utils/tax.utils';
import { taxFormSchema, type TaxFormValues } from '@/features/tax/validation/tax-form.schema';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

export function TaxFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ taxId?: string | string[] }>();
  const taxId = Array.isArray(params.taxId) ? params.taxId[0] : params.taxId;
  const existing = taxId != null ? taxSettingsRepository.getTaxById(taxId) : null;
  const isEdit = taxId != null;
  const [isSaving, setIsSaving] = useState(false);

  const catalog = taxSettingsRepository.getCatalog();
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues:
      existing == null
        ? { name: '', ratePercent: '', setAsDefault: catalog.taxes.length === 0 }
        : {
            name: existing.name,
            ratePercent: String(existing.rateBasisPoints / 100),
            setAsDefault: catalog.defaultTaxId === existing.id,
          },
    mode: 'onChange',
  });

  const name = useWatch({ control, name: 'name' }) ?? '';
  const ratePercent = useWatch({ control, name: 'ratePercent' }) ?? '';
  const preview = useMemo(() => {
    const rateBasisPoints = parseTaxPercentToBasisPoints(ratePercent);
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || rateBasisPoints == null) return '—';
    return formatSavedTaxLabel({ name: trimmedName, rateBasisPoints });
  }, [name, ratePercent]);

  const save = handleSubmit((values) => {
    const rateBasisPoints = parseTaxPercentToBasisPoints(values.ratePercent);
    if (rateBasisPoints == null) return;
    setIsSaving(true);
    try {
      if (existing != null) {
        taxSettingsRepository.updateTax({
          id: existing.id,
          name: values.name,
          rateBasisPoints,
          setAsDefault: values.setAsDefault,
        });
        showToast('success', { title: 'Tax updated' });
      } else {
        taxSettingsRepository.addTax({
          name: values.name,
          rateBasisPoints,
          setAsDefault: values.setAsDefault,
        });
        showToast('success', { title: 'Tax saved' });
      }
      router.back();
    } catch (error) {
      if (error instanceof TaxDuplicateError) {
        showToast('error', { title: 'This tax already exists.' });
      } else if (error instanceof TaxNotFoundError) {
        showToast('error', { title: 'Tax not found' });
      } else {
        showToast('error', { title: 'Could not save tax' });
      }
    } finally {
      setIsSaving(false);
    }
  });

  if (isEdit && existing == null) {
    return (
      <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
        <Header title="Edit Tax" onBack={() => router.back()} />
        <EmptyState
          title="Tax not found"
          description="This tax may have been deleted."
          primaryAction={{ label: 'Back', onPress: () => router.back() }}
        />
      </View>
    );
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header title={isEdit ? 'Edit Tax' : 'Add Tax'} onBack={() => router.back()} />
      <KeyboardAwareScrollView
        style={cStyle.flex1}
        contentContainerStyle={{
          padding: cStyleValues.spacing.lg,
          paddingBottom: cStyleValues.spacing.lg + insets.bottom,
          gap: cStyleValues.spacing.lg,
        }}
        bottomOffset={cStyleValues.spacing['4xl']}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Tax Name"
              required
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="GST"
              autoCapitalize="characters"
              errorMessage={errors.name?.message}
              accessibilityLabel="Tax name"
            />
          )}
        />
        <Controller
          control={control}
          name="ratePercent"
          render={({ field }) => (
            <Input
              label="Tax Rate"
              required
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="decimal-pad"
              suffix="%"
              placeholder="18"
              errorMessage={errors.ratePercent?.message}
              accessibilityLabel="Tax rate percent"
            />
          )}
        />
        <Card variant="outlined">
          <ThemedText
            style={[
              theme.typography.caption,
              cStyle.fontSemiBold,
              { color: theme.colors.textSecondary },
            ]}
          >
            Preview
          </ThemedText>
          <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
            {preview}
          </ThemedText>
        </Card>
        <Controller
          control={control}
          name="setAsDefault"
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              label="Set as default"
              description="New invoices will start with this tax. You can still choose No Tax."
            />
          )}
        />
        <Button
          label={isEdit ? 'Save Changes' : 'Save Tax'}
          loading={isSaving}
          onPress={() => void save()}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

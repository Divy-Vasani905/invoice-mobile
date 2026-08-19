import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { showToast } from '@/components/feedback/Toast';
import { Input } from '@/components/form/Input';
import { Card } from '@/components/layout/Card';
import { Header } from '@/components/layout/Header';
import { ThemedText } from '@/components/themed-text';
import { invoiceFeatureRepository } from '@/features/invoice/repositories/InvoiceRepository';
import { formatInvoiceNumberPreview } from '@/features/invoice/utils/invoice.utils';
import {
  invoiceNumberFormatSchema,
  type InvoiceNumberFormatFormValues,
} from '@/features/invoice/validation/invoice-number-format.schema';
import { invoiceRepository } from '@/storage';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

function loadFormValues(): InvoiceNumberFormatFormValues {
  const current = invoiceFeatureRepository.getInvoiceNumberFormat();
  return {
    prefix: current.prefix,
    nextNumber: String(current.nextNumber),
    padding: String(current.padding),
  };
}

export function InvoiceNumberFormatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<InvoiceNumberFormatFormValues>({
    resolver: zodResolver(invoiceNumberFormatSchema),
    defaultValues: loadFormValues(),
    mode: 'onChange',
  });

  const prefix = useWatch({ control, name: 'prefix' }) ?? '';
  const nextNumber = useWatch({ control, name: 'nextNumber' }) ?? '';
  const padding = useWatch({ control, name: 'padding' }) ?? '';

  const preview = useMemo(() => {
    const parsedNumber = Number(nextNumber);
    const parsedPadding = Number(padding);
    if (
      !Number.isSafeInteger(parsedNumber) ||
      parsedNumber < 1 ||
      !Number.isSafeInteger(parsedPadding) ||
      parsedPadding < 1
    ) {
      return '—';
    }

    try {
      return formatInvoiceNumberPreview({
        prefix: prefix.trim(),
        nextNumber: parsedNumber,
        paddingLength: parsedPadding,
      });
    } catch {
      return '—';
    }
  }, [nextNumber, padding, prefix]);

  const configuredNumberTaken = useMemo(() => {
    if (preview === '—') return false;
    return invoiceRepository.getAll().some((invoice) => invoice.invoiceNumber === preview);
  }, [preview]);

  const save = handleSubmit((values) => {
    setIsSaving(true);
    try {
      const result = invoiceFeatureRepository.updateInvoiceNumberFormat({
        prefix: values.prefix,
        nextNumber: Number(values.nextNumber),
        padding: Number(values.padding),
      });
      if (result.configuredNumberTaken) {
        showToast('info', {
          title: 'Number already used',
          message: `That number has already been used. The next available invoice number will be ${result.nextAvailableNumber}.`,
        });
      } else {
        showToast('success', { title: 'Invoice number format saved' });
      }
      router.back();
    } catch {
      showToast('error', {
        title: 'Could not save format',
        message: 'Please review the values and try again.',
      });
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header title="Invoice Number Format" onBack={() => router.back()} />
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
        <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>
          Set how invoice numbers are automatically generated. Existing invoices keep their current
          numbers.
        </ThemedText>

        <Controller
          control={control}
          name="prefix"
          render={({ field }) => (
            <Input
              label="Prefix"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="characters"
              autoCorrect={false}
              errorMessage={errors.prefix?.message}
              helperText="Letters, numbers, and separators such as - / _"
              accessibilityLabel="Invoice number prefix"
            />
          )}
        />

        <Controller
          control={control}
          name="nextNumber"
          render={({ field }) => (
            <Input
              label="Next Invoice Number"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="number-pad"
              errorMessage={errors.nextNumber?.message}
              accessibilityLabel="Next invoice number"
            />
          )}
        />

        <Controller
          control={control}
          name="padding"
          render={({ field }) => (
            <Input
              label="Number Padding"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="number-pad"
              errorMessage={errors.padding?.message}
              helperText="Adds zeros to the left when needed. Example: 25 → 0025."
              accessibilityLabel="Number padding"
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
          <ThemedText
            style={[theme.typography.title, { color: theme.colors.textPrimary }]}
            accessibilityLabel={`Preview ${preview}`}
          >
            {preview}
          </ThemedText>
          {configuredNumberTaken ? (
            <ThemedText style={[theme.typography.helper, { color: theme.colors.warning }]}>
              That number has already been used. The next available invoice number will be used to
              prevent duplicates.
            </ThemedText>
          ) : null}
        </Card>

        <Button label="Save Changes" loading={isSaving} onPress={() => void save()} />
      </KeyboardAwareScrollView>
    </View>
  );
}

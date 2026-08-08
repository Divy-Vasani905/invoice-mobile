import { memo, useCallback, useRef, useState } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { BottomSheet } from '@/components/feedback/BottomSheet';
import { Input } from '@/components/form/Input';
import { Select } from '@/components/form/Select';
import { Switch } from '@/components/form/Switch';
import { TextArea } from '@/components/form/TextArea';
import { SegmentControl } from '@/components/layout/SegmentControl';
import { cStyle, useTheme } from '@/theme';
import { ProductType, type ProductUnit } from '@/types/models';

import {
  CURRENCY_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  PRODUCT_UNIT_OPTIONS,
} from '../utils/product.utils';

import type { ProductFormValues } from '../types/product.types';
import type BottomSheetNative from '@gorhom/bottom-sheet';

export interface ProductFormProps {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  isSaving: boolean;
  isEdit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
}

type PickerTarget = 'unit' | 'currency' | null;

export const ProductForm = memo(function ProductForm({
  control,
  errors,
  isSaving,
  isEdit,
  onCancel,
  onSubmit,
  onDelete,
}: ProductFormProps) {
  const { theme } = useTheme();
  const sheetRef = useRef<BottomSheetNative>(null);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [pendingChange, setPendingChange] = useState<((value: string) => void) | null>(null);

  const openPicker = useCallback(
    (target: Exclude<PickerTarget, null>, onChange: (value: string) => void) => {
      setPickerTarget(target);
      setPendingChange(() => onChange);
      sheetRef.current?.expand();
    },
    [],
  );

  const closePicker = useCallback(() => {
    sheetRef.current?.close();
    setPickerTarget(null);
    setPendingChange(null);
  }, []);

  const pickerOptions = pickerTarget === 'currency' ? CURRENCY_OPTIONS : PRODUCT_UNIT_OPTIONS;

  return (
    <View style={[cStyle.g16]}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            label="Product / Service Name"
            required
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.name?.message}
            placeholder="Enter name"
            autoCapitalize="words"
            accessibilityLabel="Product or service name"
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextArea
            label="Description"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.description?.message}
            placeholder="Optional description"
            autoGrow
            accessibilityLabel="Product description"
          />
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <View style={[cStyle.g8]}>
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>Type</Text>
            <SegmentControl
              equalWidth
              value={field.value}
              onValueChange={(value) => field.onChange(value as ProductType)}
              options={PRODUCT_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="sku"
        render={({ field }) => (
          <Input
            label="SKU"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.sku?.message}
            placeholder="Optional SKU"
            autoCapitalize="characters"
            accessibilityLabel="SKU"
          />
        )}
      />

      <Controller
        control={control}
        name="unit"
        render={({ field }) => (
          <Select
            label="Unit"
            options={PRODUCT_UNIT_OPTIONS}
            value={field.value}
            placeholder="Select unit"
            errorMessage={errors.unit?.message}
            onOpen={() => openPicker('unit', (value) => field.onChange(value as ProductUnit))}
            accessibilityLabel="Unit"
          />
        )}
      />

      <Controller
        control={control}
        name="unitPrice"
        render={({ field }) => (
          <Input
            label="Price"
            required
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.unitPrice?.message}
            placeholder="0.00"
            keyboardType="decimal-pad"
            accessibilityLabel="Price"
          />
        )}
      />

      <Controller
        control={control}
        name="taxRate"
        render={({ field }) => (
          <Input
            label="Tax Rate"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.taxRate?.message}
            placeholder="0"
            suffix="%"
            keyboardType="decimal-pad"
            accessibilityLabel="Tax rate"
            helperText="Optional. Enter a percentage from 0 to 100."
          />
        )}
      />

      <Controller
        control={control}
        name="currencyCode"
        render={({ field }) => (
          <Select
            label="Currency"
            options={CURRENCY_OPTIONS}
            value={field.value}
            placeholder="Select currency"
            errorMessage={errors.currencyCode?.message}
            onOpen={() => openPicker('currency', field.onChange)}
            accessibilityLabel="Currency"
          />
        )}
      />

      {isEdit && (
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch
              label="Active"
              description="Inactive products stay available for historical invoices."
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
      )}

      <View style={[cStyle.flexRow, cStyle.g12]}>
        <Button
          label="Cancel"
          variant="outline"
          onPress={onCancel}
          disabled={isSaving}
          style={cStyle.flex1}
        />
        <Button
          label={isEdit ? 'Save Changes' : 'Save Product'}
          onPress={onSubmit}
          loading={isSaving}
          style={cStyle.flex1}
          accessibilityHint="Validates and saves this product or service"
        />
      </View>

      {isEdit && onDelete != null && (
        <Button
          label="Delete Product"
          variant="ghost"
          onPress={onDelete}
          disabled={isSaving}
          accessibilityHint="Opens a deletion confirmation"
        />
      )}

      <BottomSheet
        ref={sheetRef}
        index={-1}
        title={pickerTarget === 'currency' ? 'Select currency' : 'Select unit'}
        onClose={closePicker}
        enablePanDownToClose
      >
        <View style={[cStyle.g8]}>
          {pickerOptions.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              onPress={() => {
                pendingChange?.(option.value);
                closePicker();
              }}
              style={[
                cStyle.ph16,
                cStyle.pv12,
                cStyle.r12,
                { backgroundColor: theme.colors.backgroundSubtle },
              ]}
            >
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
});

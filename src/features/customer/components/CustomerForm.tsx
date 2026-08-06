import { memo } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { TextArea } from '@/components/form/TextArea';
import { cStyle } from '@/theme';

import type { CustomerFormValues } from '../types/customer.types';

export interface CustomerFormProps {
  control: Control<CustomerFormValues>;
  errors: FieldErrors<CustomerFormValues>;
  isSaving: boolean;
  isEdit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
}

export const CustomerForm = memo(function CustomerForm({
  control,
  errors,
  isSaving,
  isEdit,
  onCancel,
  onSubmit,
  onDelete,
}: CustomerFormProps) {
  return (
    <View style={[cStyle.g16]}>
      <Controller
        control={control}
        name="displayName"
        render={({ field }) => (
          <Input
            label="Customer Name"
            required
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.displayName?.message}
            placeholder="Enter customer name"
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="companyName"
        render={({ field }) => (
          <Input
            label="Company Name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.companyName?.message}
            placeholder="Enter company name"
            autoCapitalize="words"
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <Input
            label="Phone Number"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.phone?.message}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.email?.message}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />
        )}
      />
      <Controller
        control={control}
        name="taxId"
        render={({ field }) => (
          <Input
            label="Tax ID / GST / VAT"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.taxId?.message}
            placeholder="Enter tax registration number"
            autoCapitalize="characters"
          />
        )}
      />
      <Controller
        control={control}
        name="billingAddress"
        render={({ field }) => (
          <TextArea
            label="Billing Address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.billingAddress?.message}
            placeholder="Enter billing address"
            autoGrow
            textContentType="fullStreetAddress"
          />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <TextArea
            label="Internal Notes"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.notes?.message}
            placeholder="Notes visible only to you"
            autoGrow
            maxLength={500}
            showCharacterCount
          />
        )}
      />
      <View style={[cStyle.flexRow, cStyle.g12]}>
        <Button
          label="Cancel"
          variant="outline"
          onPress={onCancel}
          disabled={isSaving}
          style={cStyle.flex1}
        />
        <Button label="Save Customer" onPress={onSubmit} loading={isSaving} style={cStyle.flex1} />
      </View>
      {isEdit && onDelete != null && (
        <Button
          label="Delete Customer"
          variant="ghost"
          onPress={onDelete}
          disabled={isSaving}
          accessibilityHint="Opens a deletion confirmation"
        />
      )}
    </View>
  );
});

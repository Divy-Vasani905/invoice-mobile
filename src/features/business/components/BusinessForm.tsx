import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { TextArea } from '@/components/form/TextArea';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';

import { BusinessImageField } from './BusinessImageField';
import { removeBusinessAsset } from '../utils/business-assets';
import { pickBusinessImage } from '../utils/pick-business-image';

import type { BusinessFormValues } from '../types/business.types';

export interface BusinessFormProps {
  control: Control<BusinessFormValues>;
  errors: FieldErrors<BusinessFormValues>;
  isSaving: boolean;
  isEdit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function BusinessForm({
  control,
  errors,
  isSaving,
  isEdit,
  onCancel,
  onSubmit,
}: BusinessFormProps) {
  const { theme } = useTheme();

  return (
    <View style={[cStyle.g16]}>
      <Controller
        control={control}
        name="logoUri"
        render={({ field }) => (
          <BusinessImageField
            label="Business Logo"
            uri={field.value}
            placeholderLabel="Logo Placeholder"
            changeLabel="Change Logo"
            removeLabel="Remove Logo"
            onChangePress={() => {
              void pickBusinessImage('logo').then((uri) => {
                if (uri == null) return;
                void removeBusinessAsset(field.value);
                field.onChange(uri);
              });
            }}
            onRemovePress={() => {
              void removeBusinessAsset(field.value);
              field.onChange('');
            }}
          />
        )}
      />

      <Controller
        control={control}
        name="displayName"
        render={({ field }) => (
          <Input
            label="Business Name"
            required
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.displayName?.message}
            placeholder="e.g. Acme Corp"
            autoCapitalize="words"
            accessibilityLabel="Business Name"
          />
        )}
      />

      <Controller
        control={control}
        name="taxId"
        render={({ field }) => (
          <Input
            label="GST / Tax ID"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.taxId?.message}
            placeholder="Enter tax registration number"
            autoCapitalize="characters"
            accessibilityLabel="GST or Tax ID"
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
            accessibilityLabel="Phone Number"
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="Email Address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.email?.message}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            accessibilityLabel="Email Address"
          />
        )}
      />

      <Controller
        control={control}
        name="website"
        render={({ field }) => (
          <Input
            label="Website"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.website?.message}
            placeholder="www.example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            accessibilityLabel="Website"
          />
        )}
      />

      <View style={[cStyle.g12]}>
        <ThemedText style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
          Business Address
        </ThemedText>
        <Controller
          control={control}
          name="addressLine1"
          render={({ field }) => (
            <Input
              label="Street / Address"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessage={errors.addressLine1?.message}
              placeholder="Street address"
              autoComplete="street-address"
            />
          )}
        />
        <Controller
          control={control}
          name="addressLine2"
          render={({ field }) => (
            <Input
              label="Address Line 2"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessage={errors.addressLine2?.message}
              placeholder="Apartment, suite, etc."
            />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <Input
              label="City"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessage={errors.city?.message}
              placeholder="City"
            />
          )}
        />
        <Controller
          control={control}
          name="state"
          render={({ field }) => (
            <Input
              label="State / Province"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessage={errors.state?.message}
              placeholder="State or province"
            />
          )}
        />
        <Controller
          control={control}
          name="postalCode"
          render={({ field }) => (
            <Input
              label="Postal Code"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessage={errors.postalCode?.message}
              placeholder="Postal code"
              autoComplete="postal-code"
            />
          )}
        />
        <Controller
          control={control}
          name="countryCode"
          render={({ field }) => (
            <Input
              label="Country"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessage={errors.countryCode?.message}
              placeholder="Country code (e.g. US, IN)"
              autoCapitalize="characters"
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="authorizedSignatureUri"
        render={({ field }) => (
          <BusinessImageField
            label="Authorized Signature"
            uri={field.value}
            placeholderLabel="Upload signature image"
            changeLabel="Upload Signature"
            removeLabel="Remove Signature"
            aspectRatio={3}
            onChangePress={() => {
              void pickBusinessImage('signature').then((uri) => {
                if (uri == null) return;
                void removeBusinessAsset(field.value);
                field.onChange(uri);
              });
            }}
            onRemovePress={() => {
              void removeBusinessAsset(field.value);
              field.onChange('');
            }}
          />
        )}
      />

      <Controller
        control={control}
        name="defaultInvoiceNotes"
        render={({ field }) => (
          <TextArea
            label="Default Invoice Notes"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errors.defaultInvoiceNotes?.message}
            placeholder="Terms and conditions, bank details, or thank you message."
            autoGrow
            maxLength={1000}
            showCharacterCount
            accessibilityLabel="Default Invoice Notes"
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
        <Button
          label={isEdit ? 'Save Profile' : 'Save Business'}
          onPress={onSubmit}
          loading={isSaving}
          style={cStyle.flex1}
          accessibilityHint="Validates and saves the business profile"
        />
      </View>
    </View>
  );
}

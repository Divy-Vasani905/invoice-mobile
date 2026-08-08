import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { Modal } from '@/components/feedback/Modal';
import { showToast } from '@/components/feedback/Toast';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { CustomerForm } from '../components/CustomerForm';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerHasInvoicesError, type CustomerFormValues } from '../types/customer.types';
import { EMPTY_CUSTOMER_FORM, toCustomerFormValues } from '../utils/customer.utils';
import { customerSchema } from '../validation/customer.schema';

export interface CustomerFormScreenProps {
  customerId?: string;
}

export const CustomerFormScreen = memo(function CustomerFormScreen({
  customerId,
}: CustomerFormScreenProps) {
  const isEdit = customerId != null;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletionMessage, setDeletionMessage] = useState<string>();
  const {
    customer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isLoading,
    isSaving,
    isDeleting,
  } = useCustomers(customerId);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY_CUSTOMER_FORM,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (customer != null) reset(toCustomerFormValues(customer));
  }, [customer, reset]);

  const close = useCallback(() => router.back(), [router]);
  const save = handleSubmit(async (values) => {
    try {
      if (customerId == null) {
        await createCustomer(values);
        showToast('success', { title: 'Customer added' });
      } else {
        await updateCustomer({ id: customerId, values });
        showToast('success', { title: 'Customer updated' });
      }
      router.back();
    } catch {
      showToast('error', {
        title: 'Customer could not be saved',
        message: 'Please review the details and try again.',
      });
    }
  });
  const confirmDelete = useCallback(async () => {
    if (customerId == null) return;
    try {
      await deleteCustomer(customerId);
      setShowDeleteConfirmation(false);
      showToast('success', { title: 'Customer deleted' });
      router.back();
    } catch (error) {
      setShowDeleteConfirmation(false);
      setDeletionMessage(
        error instanceof CustomerHasInvoicesError
          ? error.message
          : 'This customer could not be deleted. Please try again.',
      );
    }
  }, [customerId, deleteCustomer, router]);

  if (isEdit && isLoading) return <Loader mode="fullScreen" text="Loading customer" />;
  if (isEdit && customer == null) {
    return (
      <EmptyState
        title="Customer not found"
        description="This customer may have been removed."
        primaryAction={{ label: 'Go Back', onPress: close }}
      />
    );
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: isEdit ? 'Edit Customer' : 'Add Customer' }} />
      <KeyboardAwareScrollView
        style={cStyle.flex1}
        contentContainerStyle={{
          padding: cStyleValues.spacing.lg,
          paddingBottom: cStyleValues.spacing.lg + insets.bottom,
        }}
        bottomOffset={cStyleValues.spacing['4xl']}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <CustomerForm
          control={control}
          errors={errors}
          isSaving={isSaving}
          isEdit={isEdit}
          onCancel={close}
          onSubmit={save}
          onDelete={() => setShowDeleteConfirmation(true)}
        />
      </KeyboardAwareScrollView>
      <Modal
        visible={showDeleteConfirmation}
        title="Delete customer?"
        description="This action cannot be undone."
        variant="destructive"
        primaryAction={{
          label: 'Delete',
          onPress: confirmDelete,
          loading: isDeleting,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setShowDeleteConfirmation(false),
          disabled: isDeleting,
        }}
        onRequestClose={() => setShowDeleteConfirmation(false)}
      />
      <Modal
        visible={deletionMessage != null}
        title="Customer cannot be deleted"
        description={deletionMessage}
        primaryAction={{ label: 'OK', onPress: () => setDeletionMessage(undefined) }}
        onRequestClose={() => setDeletionMessage(undefined)}
      />
    </View>
  );
});

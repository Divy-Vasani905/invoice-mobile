import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { showToast } from '@/components/feedback/Toast';
import { Header } from '@/components/layout/Header';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { BusinessForm } from '../components/BusinessForm';
import { useBusiness } from '../hooks/useBusiness';
import { EMPTY_BUSINESS_FORM, toBusinessFormValues } from '../utils/business.utils';
import { businessSchema } from '../validation/business.schema';

import type { BusinessFormValues } from '../types/business.types';

export function BusinessFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const {
    business,
    createBusiness,
    updateBusiness,
    isLoading,
    isSaving,
    isError,
    refreshBusiness,
  } = useBusiness();
  const isEdit = business != null;
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: EMPTY_BUSINESS_FORM,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (business != null) {
      reset(toBusinessFormValues(business));
      return;
    }
    reset(EMPTY_BUSINESS_FORM);
  }, [business, reset]);

  const close = () => router.back();
  const save = handleSubmit(async (values) => {
    try {
      if (isEdit) {
        await updateBusiness(values);
        showToast('success', { title: 'Business profile updated' });
      } else {
        await createBusiness(values);
        showToast('success', { title: 'Business saved' });
      }
      router.back();
    } catch {
      showToast('error', {
        title: 'Business could not be saved',
        message: 'Please review the details and try again.',
      });
    }
  });

  if (isLoading) return <Loader mode="fullScreen" text="Loading business profile" />;

  if (isError) {
    return (
      <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
        <Header title={isEdit ? 'Edit Business' : 'Add Business'} onBack={close} />
        <EmptyState
          title="Unable to load business"
          description="Please try again."
          primaryAction={{ label: 'Retry', onPress: refreshBusiness }}
        />
      </View>
    );
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header title={isEdit ? 'Edit Business' : 'Add Business'} onBack={close} />
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
        <BusinessForm
          control={control}
          errors={errors}
          isSaving={isSaving}
          isEdit={isEdit}
          onCancel={close}
          onSubmit={save}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

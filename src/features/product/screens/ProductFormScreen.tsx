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

import { ProductForm } from '../components/ProductForm';
import { useProducts } from '../hooks/useProducts';
import { ProductReferencedError, type ProductFormValues } from '../types/product.types';
import { toProductFormValues } from '../utils/product.utils';
import { productSchema } from '../validation/product.schema';

export interface ProductFormScreenProps {
  productId?: string;
}

export const ProductFormScreen = memo(function ProductFormScreen({
  productId,
}: ProductFormScreenProps) {
  const isEdit = productId != null;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletionMessage, setDeletionMessage] = useState<string>();
  const {
    product,
    defaultFormValues,
    createProduct,
    updateProduct,
    deleteProduct,
    deactivateProduct,
    isLoading,
    isSaving,
    isDeleting,
  } = useProducts(productId);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultFormValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (product != null) {
      reset(toProductFormValues(product));
      return;
    }
    if (!isEdit) reset(defaultFormValues);
  }, [defaultFormValues, isEdit, product, reset]);

  const close = useCallback(() => router.back(), [router]);
  const save = handleSubmit(async (values) => {
    try {
      if (productId == null) {
        await createProduct(values);
        showToast('success', { title: 'Product saved' });
      } else {
        await updateProduct({ id: productId, values });
        showToast('success', { title: 'Product updated' });
      }
      router.back();
    } catch {
      showToast('error', {
        title: 'Product could not be saved',
        message: 'Please review the details and try again.',
      });
    }
  });

  const confirmDelete = useCallback(async () => {
    if (productId == null) return;
    try {
      await deleteProduct(productId);
      setShowDeleteConfirmation(false);
      showToast('success', { title: 'Product deleted' });
      router.back();
    } catch (error) {
      setShowDeleteConfirmation(false);
      setDeletionMessage(
        error instanceof ProductReferencedError
          ? error.message
          : 'This product could not be deleted. Please try again.',
      );
    }
  }, [deleteProduct, productId, router]);

  const confirmDeactivate = useCallback(async () => {
    if (productId == null) return;
    try {
      await deactivateProduct(productId);
      setDeletionMessage(undefined);
      showToast('success', { title: 'Product deactivated' });
      router.back();
    } catch {
      showToast('error', {
        title: 'Unable to deactivate product',
        message: 'Please try again.',
      });
    }
  }, [deactivateProduct, productId, router]);

  if (isEdit && isLoading) return <Loader mode="fullScreen" text="Loading product" />;
  if (isEdit && product == null) {
    return (
      <EmptyState
        title="Product not found"
        description="This product may have been removed."
        primaryAction={{ label: 'Go Back', onPress: close }}
      />
    );
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: isEdit ? 'Edit Product' : 'Add Product' }} />
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
        <ProductForm
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
        title="Delete Product?"
        description={`Are you sure you want to delete "${product?.name ?? 'this product'}"?`}
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
        title="Product cannot be deleted"
        description={deletionMessage}
        primaryAction={{
          label: 'Deactivate instead',
          onPress: confirmDeactivate,
          loading: isDeleting,
        }}
        secondaryAction={{
          label: 'OK',
          onPress: () => setDeletionMessage(undefined),
          disabled: isDeleting,
        }}
        onRequestClose={() => setDeletionMessage(undefined)}
      />
    </View>
  );
});

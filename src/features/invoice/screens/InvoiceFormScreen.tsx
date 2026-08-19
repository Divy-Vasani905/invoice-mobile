import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { showToast } from '@/components/feedback/Toast';
import { Input } from '@/components/form/Input';
import { TextArea } from '@/components/form/TextArea';
import { ThemedText } from '@/components/themed-text';
import { businessFeatureRepository } from '@/features/business/repositories/BusinessRepository';
import { useCustomers } from '@/features/customer/hooks/useCustomers';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useProducts } from '@/features/product/hooks/useProducts';
import { taxSettingsRepository } from '@/features/tax/repositories/TaxSettingsRepository';
import {
  NO_TAX_SELECTION_ID,
  SNAPSHOT_TAX_SELECTION_ID,
  formatSavedTaxLabel,
} from '@/features/tax/utils/tax.utils';
import { ROUTES } from '@/navigation';
import { getPreferredCurrencyCode } from '@/stores/user-preferences';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';
import { InvoiceStatus } from '@/types/models';

import { InvoiceCustomerPicker } from '../components/InvoiceCustomerPicker';
import { InvoiceItemEditor } from '../components/InvoiceItemEditor';
import { InvoiceItemRow } from '../components/InvoiceItemRow';
import { InvoiceProductPicker } from '../components/InvoiceProductPicker';
import { InvoiceSummary } from '../components/InvoiceSummary';
import { InvoiceTaxPicker } from '../components/InvoiceTaxPicker';
import { useInvoices } from '../hooks/useInvoices';
import {
  calculateFormTotals,
  createEmptyFormItem,
  productToFormItem,
  toInvoiceFormValues,
} from '../utils/invoice.utils';
import { invoiceDraftSchema, invoiceFinalSchema } from '../validation/invoice.schema';

import type { InvoiceFormItemValues, InvoiceFormValues } from '../types/invoice.types';

export interface InvoiceFormScreenProps {
  invoiceId?: string;
}

export const InvoiceFormScreen = memo(function InvoiceFormScreen({
  invoiceId,
}: InvoiceFormScreenProps) {
  const isEdit = invoiceId != null;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [missingBusiness, setMissingBusiness] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showTaxPicker, setShowTaxPicker] = useState(false);
  const [taxCatalog, setTaxCatalog] = useState(() => taxSettingsRepository.getCatalog());

  const { openBusinessProfile } = useDashboard();

  const {
    invoice,
    createInvoice,
    updateInvoice,
    getDefaultCreateFormValues,
    isLoading,
    isSaving,
    MissingBusinessError,
    InvoiceValidationError,
    InsufficientInvoiceCreditsError,
  } = useInvoices(invoiceId);

  const {
    customers,
    searchQuery: customerSearch,
    setSearchQuery: setCustomerSearch,
    refreshCustomers,
    isEmpty: customersEmpty,
    hasNoSearchResults: customersNoResults,
  } = useCustomers();

  const {
    products,
    searchQuery: productSearch,
    setSearchQuery: setProductSearch,
    refreshProducts,
    isEmpty: productsEmpty,
    hasNoSearchResults: productsNoResults,
  } = useProducts();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    getValues,
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceDraftSchema),
    defaultValues: {
      invoiceNumber: '',
      customerId: '',
      customerName: '',
      issuedAt: '',
      dueAt: '',
      currencyCode: getPreferredCurrencyCode(),
      notes: '',
      items: [],
      status: InvoiceStatus.Draft,
      appliedTaxId: NO_TAX_SELECTION_ID,
      appliedTaxName: '',
      appliedTaxRateBasisPoints: 0,
      useLegacyItemTax: false,
    },
    mode: 'onSubmit',
  });

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'items',
    keyName: 'fieldKey',
  });

  const watchedItems = useWatch({ control, name: 'items' });
  const watchedCurrency = useWatch({ control, name: 'currencyCode' });
  const watchedCustomerName = useWatch({ control, name: 'customerName' });
  const watchedInvoiceNumber = useWatch({ control, name: 'invoiceNumber' });
  const watchedAppliedTaxId = useWatch({ control, name: 'appliedTaxId' });
  const watchedAppliedTaxName = useWatch({ control, name: 'appliedTaxName' });
  const watchedAppliedTaxRate = useWatch({ control, name: 'appliedTaxRateBasisPoints' });
  const watchedUseLegacyItemTax = useWatch({ control, name: 'useLegacyItemTax' });

  const calculation = useMemo(
    () =>
      calculateFormTotals(watchedItems ?? [], watchedCurrency || getPreferredCurrencyCode(), {
        appliedTaxId: watchedAppliedTaxId ?? NO_TAX_SELECTION_ID,
        appliedTaxName: watchedAppliedTaxName ?? '',
        appliedTaxRateBasisPoints: watchedAppliedTaxRate ?? 0,
        useLegacyItemTax: watchedUseLegacyItemTax === true,
      }),
    [
      watchedAppliedTaxId,
      watchedAppliedTaxName,
      watchedAppliedTaxRate,
      watchedCurrency,
      watchedItems,
      watchedUseLegacyItemTax,
    ],
  );

  useEffect(() => {
    if (isEdit) {
      if (invoice != null) {
        reset(toInvoiceFormValues(invoice, taxSettingsRepository.getCatalog()));
        setBootstrapped(true);
        setMissingBusiness(false);
      }
      return;
    }

    if (bootstrapped) return;
    try {
      const defaults = getDefaultCreateFormValues();
      reset(defaults);
      setMissingBusiness(false);
      setBootstrapped(true);
    } catch (error) {
      if (error instanceof MissingBusinessError) {
        setMissingBusiness(true);
        setBootstrapped(true);
        return;
      }
      showToast('error', {
        title: 'Unable to start invoice',
        message: 'Please try again.',
      });
    }
  }, [MissingBusinessError, bootstrapped, getDefaultCreateFormValues, invoice, isEdit, reset]);

  useFocusEffect(
    useCallback(() => {
      void refreshCustomers();
      void refreshProducts();
      setTaxCatalog(taxSettingsRepository.getCatalog());
      if (!isEdit && bootstrapped && !missingBusiness) {
        try {
          const defaults = getDefaultCreateFormValues();
          setValue('invoiceNumber', defaults.invoiceNumber);
        } catch {
          // Keep the current preview if numbering cannot be refreshed.
        }
      }
    }, [
      bootstrapped,
      getDefaultCreateFormValues,
      isEdit,
      missingBusiness,
      refreshCustomers,
      refreshProducts,
      setValue,
    ]),
  );

  const close = useCallback(() => router.back(), [router]);

  const persist = useCallback(
    async (values: InvoiceFormValues, asDraft: boolean) => {
      try {
        if (!asDraft) {
          const parsed = invoiceFinalSchema.safeParse(values);
          if (!parsed.success) {
            const message = parsed.error.issues[0]?.message ?? 'Please complete required fields.';
            showToast('error', { title: 'Cannot save invoice', message });
            return;
          }
        }

        if (businessFeatureRepository.getActiveBusiness() == null) {
          showToast('error', {
            title: 'Business profile required',
            message: 'Add a business profile before saving invoices.',
          });
          return;
        }

        if (invoiceId == null) {
          const created = await createInvoice({ values, asDraft });
          showToast('success', {
            title: asDraft ? 'Draft saved' : 'Invoice saved',
          });
          router.replace(ROUTES.invoicePreview(created.id));
          return;
        }

        const updated = await updateInvoice({ id: invoiceId, values, asDraft });
        showToast('success', {
          title: asDraft ? 'Draft updated' : 'Invoice updated',
        });
        router.replace(ROUTES.invoicePreview(updated.id));
      } catch (error) {
        if (error instanceof InsufficientInvoiceCreditsError) {
          showToast('error', {
            title: 'No invoices remaining',
            message: error.message,
          });
          return;
        }
        const message =
          error instanceof InvoiceValidationError || error instanceof MissingBusinessError
            ? error.message
            : 'Please review the details and try again.';
        showToast('error', {
          title: asDraft ? 'Draft could not be saved' : 'Invoice could not be saved',
          message,
        });
      }
    },
    [
      InsufficientInvoiceCreditsError,
      InvoiceValidationError,
      MissingBusinessError,
      createInvoice,
      invoiceId,
      router,
      updateInvoice,
    ],
  );

  const saveDraft = handleSubmit((values) => persist(values, true));
  const saveFinal = handleSubmit((values) => persist(values, false));

  const editingItem = useMemo(
    () => watchedItems?.find((item) => item.id === editingItemId) ?? null,
    [editingItemId, watchedItems],
  );

  const handleSelectCustomer = useCallback(
    (customerId: string, customerName: string) => {
      setValue('customerId', customerId, { shouldDirty: true });
      setValue('customerName', customerName, { shouldDirty: true });
    },
    [setValue],
  );

  const handleSelectProduct = useCallback(
    (productId: string) => {
      const product = products.find((entry) => entry.product.id === productId)?.product;
      if (product == null) return;
      const item = productToFormItem(product);
      if (getValues('useLegacyItemTax') !== true) {
        item.taxRate = '';
      }
      append(item);
    },
    [append, getValues, products],
  );

  const handleAddManual = useCallback(() => {
    const currencyCode = getValues('currencyCode') || 'USD';
    const item = createEmptyFormItem(currencyCode);
    append(item);
    setEditingItemId(item.id);
  }, [append, getValues]);

  const handleSaveItem = useCallback(
    (item: InvoiceFormItemValues) => {
      const index = fields.findIndex((field) => field.id === item.id);
      if (index >= 0) update(index, item);
      setEditingItemId(null);
    },
    [fields, update],
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const index = fields.findIndex((field) => field.id === itemId);
      if (index >= 0) remove(index);
    },
    [fields, remove],
  );

  if (isEdit && isLoading && invoice == null) {
    return <Loader mode="fullScreen" text="Loading invoice" />;
  }

  if (missingBusiness) {
    return (
      <EmptyState
        title="Business profile required"
        description="Add your business details before creating invoices."
        primaryAction={{
          label: 'Business Profile',
          onPress: () => openBusinessProfile(),
        }}
        secondaryAction={{ label: 'Cancel', onPress: close }}
      />
    );
  }

  if (isEdit && bootstrapped && invoice == null) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This invoice may have been deleted."
        primaryAction={{ label: 'Back', onPress: close }}
      />
    );
  }

  if (!bootstrapped) {
    return <Loader mode="fullScreen" text={isEdit ? 'Loading invoice' : 'Preparing invoice'} />;
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: isEdit ? 'Edit Invoice' : 'Create Invoice',
          headerRight: () => (
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              style={{ paddingHorizontal: cStyleValues.spacing.sm }}
            >
              <Ionicons name="close" size={theme.iconSizes.md} color={theme.colors.textPrimary} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: cStyleValues.spacing.lg,
          paddingTop: cStyleValues.spacing.md,
          paddingBottom: insets.bottom + cStyleValues.spacing['7xl'],
          gap: cStyleValues.spacing.lg,
        }}
      >
        <Controller
          control={control}
          name="invoiceNumber"
          render={({ field }) => (
            <Input
              label="Invoice Number"
              value={field.value}
              readOnly
              accessibilityLabel="Invoice number"
              helperText={
                isEdit
                  ? 'This invoice keeps its original number.'
                  : 'Assigned automatically when you save. Opening or canceling this screen does not use a number.'
              }
            />
          )}
        />

        <View style={[cStyle.flexRow, cStyle.g12]}>
          <View style={cStyle.flex1}>
            <Controller
              control={control}
              name="issuedAt"
              render={({ field }) => (
                <Input
                  label="Issue Date"
                  required
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="YYYY-MM-DD"
                  errorMessage={errors.issuedAt?.message}
                  accessibilityLabel="Issue date"
                />
              )}
            />
          </View>
          <View style={cStyle.flex1}>
            <Controller
              control={control}
              name="dueAt"
              render={({ field }) => (
                <Input
                  label="Due Date"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="YYYY-MM-DD"
                  errorMessage={errors.dueAt?.message}
                  accessibilityLabel="Due date"
                />
              )}
            />
          </View>
        </View>

        <View style={[cStyle.g8]}>
          <ThemedText style={[theme.typography.label, { color: theme.colors.textSecondary }]}>
            Customer
          </ThemedText>
          <Pressable
            onPress={() => setShowCustomerPicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Select customer"
            accessibilityHint="Opens customer selection"
            style={{
              minHeight: theme.inputs.layout.minHeight,
              borderWidth: theme.inputs.layout.borderWidth,
              borderColor: theme.colors.border,
              borderRadius: theme.inputs.layout.radius,
              paddingHorizontal: theme.inputs.layout.paddingHorizontal,
              justifyContent: 'center',
              backgroundColor: theme.colors.surface,
            }}
          >
            <ThemedText
              style={[
                theme.typography.bodyMedium,
                {
                  color:
                    watchedCustomerName?.trim().length > 0
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {watchedCustomerName?.trim().length > 0 ? watchedCustomerName : 'Select a customer'}
            </ThemedText>
          </Pressable>
          {errors.customerId?.message != null ? (
            <ThemedText style={[theme.typography.caption, { color: theme.colors.danger }]}>
              {errors.customerId.message}
            </ThemedText>
          ) : null}
        </View>

        <View style={[cStyle.g12]}>
          <View style={[cStyle.flexRow, cStyle.justifyBetween, cStyle.itemCenter]}>
            <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
              Items
            </ThemedText>
            <Button
              label="Add Item"
              size="sm"
              variant="secondary"
              leftIcon={({ color, size }) => <Ionicons name="add" color={color} size={size} />}
              onPress={() => setShowProductPicker(true)}
              accessibilityLabel="Add product"
              accessibilityHint="Opens product selection"
            />
          </View>
          {fields.length === 0 ? (
            <EmptyState
              title="No items yet"
              description="Add a product or a manual line item."
              primaryAction={{
                label: 'Add Item',
                onPress: () => setShowProductPicker(true),
              }}
            />
          ) : (
            fields.map((field, index) => {
              const item = watchedItems?.[index] ?? field;
              const lineTotal = calculation?.itemTotals.find(
                (entry) => entry.itemId === item.id,
              )?.totalMinor;
              return (
                <InvoiceItemRow
                  key={field.fieldKey}
                  item={item}
                  currencyCode={watchedCurrency || 'USD'}
                  lineTotalMinor={lineTotal}
                  onEdit={setEditingItemId}
                  onRemove={handleRemoveItem}
                />
              );
            })
          )}
          {typeof errors.items?.message === 'string' ? (
            <ThemedText style={[theme.typography.caption, { color: theme.colors.danger }]}>
              {errors.items.message}
            </ThemedText>
          ) : null}
        </View>

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <TextArea
              label="Notes"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Payment terms, thank-you note, or other details"
              accessibilityLabel="Invoice notes"
            />
          )}
        />

        {taxCatalog.enabled || isEdit ? (
          <InvoiceTaxPicker
            visible={showTaxPicker}
            taxes={taxCatalog.enabled ? taxCatalog.taxes : []}
            selectedId={watchedAppliedTaxId ?? NO_TAX_SELECTION_ID}
            snapshotLabel={
              watchedAppliedTaxId === SNAPSHOT_TAX_SELECTION_ID && watchedAppliedTaxName
                ? formatSavedTaxLabel({
                    name: watchedAppliedTaxName,
                    rateBasisPoints: watchedAppliedTaxRate ?? 0,
                  })
                : undefined
            }
            disabled={!taxCatalog.enabled && watchedAppliedTaxId === NO_TAX_SELECTION_ID}
            onOpen={() => setShowTaxPicker(true)}
            onClose={() => setShowTaxPicker(false)}
            onSelect={(tax) => {
              if (tax === 'snapshot') {
                setValue('appliedTaxId', SNAPSHOT_TAX_SELECTION_ID, { shouldDirty: true });
                setValue('useLegacyItemTax', false, { shouldDirty: true });
                return;
              }
              if (tax == null) {
                setValue('appliedTaxId', NO_TAX_SELECTION_ID, { shouldDirty: true });
                setValue('appliedTaxName', '', { shouldDirty: true });
                setValue('appliedTaxRateBasisPoints', 0, { shouldDirty: true });
                setValue('useLegacyItemTax', false, { shouldDirty: true });
                return;
              }
              setValue('appliedTaxId', tax.id, { shouldDirty: true });
              setValue('appliedTaxName', tax.name, { shouldDirty: true });
              setValue('appliedTaxRateBasisPoints', tax.rateBasisPoints, { shouldDirty: true });
              setValue('useLegacyItemTax', false, { shouldDirty: true });
            }}
          />
        ) : null}

        <InvoiceSummary
          currencyCode={watchedCurrency || 'USD'}
          subtotalMinor={calculation?.subtotalMinor ?? 0}
          discountMinor={calculation?.discountTotalMinor ?? 0}
          taxMinor={calculation?.taxTotalMinor ?? 0}
          taxLabel={
            watchedUseLegacyItemTax === true
              ? 'Tax'
              : watchedAppliedTaxId === NO_TAX_SELECTION_ID || !watchedAppliedTaxName
                ? 'Tax'
                : formatSavedTaxLabel({
                    name: watchedAppliedTaxName,
                    rateBasisPoints: watchedAppliedTaxRate ?? 0,
                  })
          }
          roundOffMinor={calculation?.roundOffMinor ?? 0}
          grandTotalMinor={calculation?.grandTotalMinor ?? 0}
        />

        <View style={[cStyle.g12]}>
          <Button
            label="Save Draft"
            variant="secondary"
            loading={isSaving}
            onPress={saveDraft}
            accessibilityLabel="Save draft"
            accessibilityHint="Saves an incomplete invoice as a draft"
          />
          <Button
            label={isEdit ? 'Save Invoice' : 'Generate Invoice'}
            loading={isSaving}
            onPress={saveFinal}
            accessibilityLabel="Save invoice"
            accessibilityHint={`Saves invoice ${watchedInvoiceNumber} and opens preview`}
          />
          <Button
            label="Cancel"
            variant="ghost"
            disabled={isSaving}
            onPress={close}
            accessibilityLabel="Cancel"
          />
        </View>
      </KeyboardAwareScrollView>

      <InvoiceCustomerPicker
        visible={showCustomerPicker}
        customers={customers}
        searchQuery={customerSearch}
        onSearchChange={setCustomerSearch}
        onClose={() => setShowCustomerPicker(false)}
        onSelect={handleSelectCustomer}
        onCreateCustomer={() => {
          setShowCustomerPicker(false);
          router.push(ROUTES.createCustomer);
        }}
        isEmpty={customersEmpty}
        hasNoSearchResults={customersNoResults}
      />

      <InvoiceProductPicker
        visible={showProductPicker}
        products={products}
        searchQuery={productSearch}
        onSearchChange={setProductSearch}
        onClose={() => setShowProductPicker(false)}
        onSelect={handleSelectProduct}
        onCreateProduct={() => {
          setShowProductPicker(false);
          router.push(ROUTES.createProduct);
        }}
        onAddManual={handleAddManual}
        isEmpty={productsEmpty}
        hasNoSearchResults={productsNoResults}
      />

      <InvoiceItemEditor
        visible={editingItemId != null}
        item={editingItem}
        showItemTax={watchedUseLegacyItemTax === true}
        onClose={() => setEditingItemId(null)}
        onSave={handleSaveItem}
      />
    </View>
  );
});

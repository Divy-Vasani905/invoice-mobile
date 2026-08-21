import Ionicons from '@expo/vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/feedback/Modal';
import { SearchInput } from '@/components/form/SearchInput';
import { ThemedText } from '@/components/themed-text';
import type { CustomerSummary } from '@/features/customer/types/customer.types';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

export interface InvoiceCustomerPickerProps {
  visible: boolean;
  customers: CustomerSummary[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (customerId: string, customerName: string) => void;
  onCreateCustomer: () => void;
  isEmpty: boolean;
  hasNoSearchResults: boolean;
}

export const InvoiceCustomerPicker = memo(function InvoiceCustomerPicker({
  visible,
  customers,
  searchQuery,
  onSearchChange,
  onClose,
  onSelect,
  onCreateCustomer,
  isEmpty,
  hasNoSearchResults,
}: InvoiceCustomerPickerProps) {
  const { theme } = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: CustomerSummary }) => (
      <Pressable
        onPress={() => {
          onSelect(item.customer.id, item.customer.displayName);
          onClose();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Select customer ${item.customer.displayName}`}
        style={{
          paddingVertical: cStyleValues.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
          {item.customer.displayName}
        </ThemedText>
        {item.customer.companyName != null && item.customer.companyName.length > 0 ? (
          <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            {item.customer.companyName}
          </ThemedText>
        ) : null}
      </Pressable>
    ),
    [
      onClose,
      onSelect,
      theme.colors.border,
      theme.colors.textPrimary,
      theme.colors.textSecondary,
      theme.typography.bodyMedium,
      theme.typography.caption,
    ],
  );

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title="Select Customer"
      description="Choose an existing customer for this invoice."
      size="lg"
      secondaryAction={{ label: 'Close', onPress: onClose }}
    >
      <View style={[cStyle.g12, { maxHeight: 420 }]}>
        <SearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder="Search customers"
          accessibilityLabel="Search customers"
        />
        <FlashList
          data={customers}
          keyExtractor={(item) => item.customer.id}
          renderItem={renderItem}
          drawDistance={160}
          keyboardShouldPersistTaps="handled"
          style={{ minHeight: 180, maxHeight: 280 }}
          ListEmptyComponent={
            <EmptyState
              variant={hasNoSearchResults ? 'search' : 'default'}
              title={hasNoSearchResults ? 'No matching customers' : 'No customers yet'}
              description={
                hasNoSearchResults
                  ? 'Try another search.'
                  : 'Create a customer to attach them to this invoice.'
              }
              primaryAction={
                isEmpty ? { label: 'Create Customer', onPress: onCreateCustomer } : undefined
              }
            />
          }
        />
        {!isEmpty ? (
          <Button
            label="Create Customer"
            variant="secondary"
            leftIcon={({ color, size }) => <Ionicons name="add" color={color} size={size} />}
            onPress={onCreateCustomer}
            accessibilityLabel="Create customer"
            accessibilityHint="Opens the create customer form"
          />
        ) : null}
      </View>
    </Modal>
  );
});

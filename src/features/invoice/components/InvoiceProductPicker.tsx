import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/feedback/Modal';
import { SearchInput } from '@/components/form/SearchInput';
import { ThemedText } from '@/components/themed-text';
import type { ProductListItem } from '@/features/product/types/product.types';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

export interface InvoiceProductPickerProps {
  visible: boolean;
  products: ProductListItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (productId: string) => void;
  onCreateProduct: () => void;
  onAddManual: () => void;
  isEmpty: boolean;
  hasNoSearchResults: boolean;
}

export const InvoiceProductPicker = memo(function InvoiceProductPicker({
  visible,
  products,
  searchQuery,
  onSearchChange,
  onClose,
  onSelect,
  onCreateProduct,
  onAddManual,
  isEmpty,
  hasNoSearchResults,
}: InvoiceProductPickerProps) {
  const { theme } = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: ProductListItem }) => (
      <Pressable
        onPress={() => {
          onSelect(item.product.id);
          onClose();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Add product ${item.product.name}`}
        style={{
          paddingVertical: cStyleValues.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
          {item.product.name}
        </ThemedText>
        <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          {item.formattedPrice}
        </ThemedText>
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
      title="Add Product"
      description="Select a product or add a custom line item."
      size="lg"
      secondaryAction={{ label: 'Close', onPress: onClose }}
    >
      <View style={[cStyle.g12, { maxHeight: 460 }]}>
        <SearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder="Search products"
          accessibilityLabel="Search products"
        />
        <FlatList
          data={products}
          keyExtractor={(item) => item.product.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              variant={hasNoSearchResults ? 'search' : 'default'}
              title={hasNoSearchResults ? 'No matching products' : 'No products yet'}
              description={
                hasNoSearchResults
                  ? 'Try another search, or add a manual item.'
                  : 'Create a product or add a manual line item.'
              }
            />
          }
        />
        <View style={[cStyle.g8]}>
          <Button
            label="Add Manual Item"
            variant="secondary"
            leftIcon={({ color, size }) => (
              <Ionicons name="create-outline" color={color} size={size} />
            )}
            onPress={() => {
              onAddManual();
              onClose();
            }}
            accessibilityLabel="Add manual item"
          />
          {!isEmpty ? (
            <Button
              label="Create Product"
              variant="ghost"
              leftIcon={({ color, size }) => <Ionicons name="add" color={color} size={size} />}
              onPress={onCreateProduct}
              accessibilityLabel="Create product"
            />
          ) : (
            <Button
              label="Create Product"
              leftIcon={({ color, size }) => <Ionicons name="add" color={color} size={size} />}
              onPress={onCreateProduct}
              accessibilityLabel="Create product"
            />
          )}
        </View>
      </View>
    </Modal>
  );
});

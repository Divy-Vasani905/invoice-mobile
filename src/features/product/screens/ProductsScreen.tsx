import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { SearchInput } from '@/components/form/SearchInput';
import { Header } from '@/components/layout/Header';
import { ROUTES } from '@/navigation';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

import type { ProductListItem } from '../types/product.types';

export const ProductsScreen = memo(function ProductsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const {
    products,
    searchQuery,
    setSearchQuery,
    refreshProducts,
    isLoading,
    isRefreshing,
    isEmpty,
    hasNoSearchResults,
    isError,
  } = useProducts();

  const openCreateProduct = useCallback(() => router.push(ROUTES.createProduct), [router]);
  const openEditProduct = useCallback(
    (productId: string) => router.push(ROUTES.editProduct(productId)),
    [router],
  );
  const goBack = useCallback(() => router.back(), [router]);
  const renderProduct = useCallback(
    ({ item }: { item: ProductListItem }) => <ProductCard item={item} onPress={openEditProduct} />,
    [openEditProduct],
  );
  const keyExtractor = useCallback((item: ProductListItem) => item.product.id, []);

  if (isLoading) return <Loader mode="fullScreen" text="Loading products" />;
  if (isError) {
    return (
      <EmptyState
        title="Unable to load products"
        description="Your products and services could not be loaded."
        primaryAction={{ label: 'Retry', onPress: refreshProducts }}
      />
    );
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header title="Products & Services" />
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          flexGrow: 1,
          gap: cStyleValues.spacing.md,
          paddingHorizontal: cStyleValues.spacing.lg,
          paddingTop: cStyleValues.spacing.xs,
          paddingBottom: cStyleValues.spacing['7xl'],
        }}
        ListHeaderComponent={
          <>
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search products or services..."
              accessibilityLabel="Search products or services"
              accessibilityHint="Search by name, description, or SKU"
            />
            <Button
              label="Add Product"
              leftIcon={({ color, size }) => <Ionicons name="add" color={color} size={size} />}
              onPress={openCreateProduct}
              accessibilityHint="Opens the add product form"
              style={{
                paddingHorizontal: cStyleValues.spacing.xl,
                marginTop: cStyleValues.spacing.lg,
              }}
            />
          </>
        }
        ListEmptyComponent={
          <EmptyState
            variant={hasNoSearchResults ? 'search' : 'default'}
            title={hasNoSearchResults ? 'No matching products' : 'No products or services yet'}
            description={
              hasNoSearchResults
                ? 'Try another name, description, or SKU.'
                : 'Add your first product or service to quickly add it to invoices.'
            }
            icon={({ color, size }) => (
              <Ionicons
                name={hasNoSearchResults ? 'search-outline' : 'cube-outline'}
                color={color}
                size={size}
              />
            )}
            primaryAction={
              isEmpty ? { label: 'Add Product', onPress: openCreateProduct } : undefined
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshProducts}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
});

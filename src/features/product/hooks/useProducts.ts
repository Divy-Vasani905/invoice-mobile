import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { AnalyticsEvents, AnalyticsService } from '@/services/analytics';

import { productFeatureRepository } from '../repositories/ProductRepository';

import type { ProductFormValues } from '../types/product.types';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

export function useProducts(productId?: string) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const productsQuery = useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () => productFeatureRepository.getProducts(),
  });
  const { refetch } = productsQuery;

  const refreshProducts = useCallback(() => refetch(), [refetch]);
  const invalidateRelated = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => productFeatureRepository.createProduct(values),
    onSuccess: async () => {
      await invalidateRelated();
      void AnalyticsService.logEvent(AnalyticsEvents.ProductCreated);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ProductFormValues }) =>
      productFeatureRepository.updateProduct(id, values),
    onSuccess: invalidateRelated,
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => productFeatureRepository.deleteProduct(id),
    onSuccess: invalidateRelated,
  });
  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => productFeatureRepository.deactivateProduct(id),
    onSuccess: invalidateRelated,
  });

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredProducts = useMemo(() => {
    if (normalizedQuery.length === 0) return products;
    return products.filter(({ product }) =>
      [product.name, product.description, product.sku].some((value) =>
        value?.toLocaleLowerCase().includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery, products]);

  const product = useMemo(
    () =>
      productId == null
        ? undefined
        : (products.find((item) => item.product.id === productId)?.product ??
          productFeatureRepository.getProductById(productId)),
    [productId, products],
  );
  const defaultFormValues = useMemo(() => productFeatureRepository.getDefaultFormValues(), []);

  return {
    products: filteredProducts,
    product,
    defaultFormValues,
    searchQuery,
    setSearchQuery,
    refreshProducts,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    deactivateProduct: deactivateMutation.mutateAsync,
    isLoading: productsQuery.isLoading,
    isRefreshing: productsQuery.isRefetching && !productsQuery.isLoading,
    isEmpty: productsQuery.isSuccess && products.length === 0,
    hasNoSearchResults:
      productsQuery.isSuccess && products.length > 0 && filteredProducts.length === 0,
    isError: productsQuery.isError,
    error: productsQuery.error,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending || deactivateMutation.isPending,
  };
}

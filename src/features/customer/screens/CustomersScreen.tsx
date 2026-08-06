import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { SearchInput } from '@/components/form/SearchInput';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import { Header } from '@/components/layout/Header';
import { ROUTES } from '@/navigation';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { CustomerCard } from '../components/CustomerCard';
import { useCustomers } from '../hooks/useCustomers';

import type { CustomerSummary } from '../types/customer.types';

export const CustomersScreen = memo(function CustomersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const {
    customers,
    searchQuery,
    setSearchQuery,
    refreshCustomers,
    isLoading,
    isRefreshing,
    isEmpty,
    hasNoSearchResults,
    isError,
  } = useCustomers();

  const openCreateCustomer = useCallback(() => router.push(ROUTES.createCustomer), [router]);
  const openEditCustomer = useCallback(
    (customerId: string) => router.push(ROUTES.editCustomer(customerId)),
    [router],
  );
  const renderCustomer = useCallback(
    ({ item }: { item: CustomerSummary }) => (
      <CustomerCard summary={item} onPress={openEditCustomer} />
    ),
    [openEditCustomer],
  );
  const keyExtractor = useCallback((item: CustomerSummary) => item.customer.id, []);

  if (isLoading) return <Loader mode="fullScreen" text="Loading customers" />;
  if (isError) {
    return (
      <EmptyState
        title="Unable to load customers"
        description="Your customer list could not be loaded."
        primaryAction={{ label: 'Retry', onPress: refreshCustomers }}
      />
    );
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Customers"
        rightActions={
          <Button
            label="Add Customer"
            labelStyle={{
              fontSize: theme.typography.button.fontSize,
              fontWeight: theme.typography.headingL.fontWeight,
            }}
            style={{
              paddingHorizontal: cStyleValues.spacing.md,
            }}
            leftIcon={({ color, size }) => <Ionicons name="add" color={color} size={size} />}
            onPress={openCreateCustomer}
            accessibilityHint="Opens the add customer form"
          />
        }
      />
      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          flexGrow: 1,
          gap: cStyleValues.spacing.md,
          paddingHorizontal: cStyleValues.spacing.lg,
          paddingTop: cStyleValues.spacing.md,
          paddingBottom: cStyleValues.spacing['7xl'],
        }}
        ListHeaderComponent={
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search customers"
            accessibilityLabel="Search customers"
            accessibilityHint="Search by customer name, company, phone, or email"
          />
        }
        ListEmptyComponent={
          <EmptyState
            variant={hasNoSearchResults ? 'search' : 'default'}
            title={hasNoSearchResults ? 'No matching customers' : 'No customers yet'}
            description={
              hasNoSearchResults
                ? 'Try another name, company, phone number, or email.'
                : 'Add your first customer to start creating invoices.'
            }
            icon={({ color, size }) => (
              <Ionicons
                name={hasNoSearchResults ? 'search-outline' : 'people-outline'}
                color={color}
                size={size}
              />
            )}
            primaryAction={
              isEmpty ? { label: 'Add Customer', onPress: openCreateCustomer } : undefined
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshCustomers}
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
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          right: cStyleValues.spacing.lg,
          bottom: cStyleValues.spacing.lg,
          ...cStyle.z40,
        }}
      >
        <FloatingActionButton
          icon={({ color, size }) => <Ionicons name="person-add" color={color} size={size} />}
          onPress={openCreateCustomer}
          accessibilityLabel="Add customer"
        />
      </View>
    </View>
  );
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { Modal } from '@/components/feedback/Modal';
import { IconButton } from '@/components/IconButton';
import { SummaryCard } from '@/components/layout/SummaryCard';
import { ThemedText } from '@/components/themed-text';
import { InvoiceCreditIndicator, InvoiceUsageModal, useInvoiceCredits } from '@/features/credits';
import { ProductCard } from '@/features/product/components/ProductCard';
import type { ProductListItem } from '@/features/product/types/product.types';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { AnalyticsCard } from '../components/AnalyticsCard';
import { InvoiceCard } from '../components/InvoiceCard';
import { useDashboard } from '../hooks/useDashboard';

import type { DashboardRecentMode, Invoice } from '../types/dashboard.types';

const RECENT_MODE_OPTIONS: { value: DashboardRecentMode; label: string }[] = [
  { value: 'invoices', label: 'Recent Invoices' },
  { value: 'products', label: 'Recent Products' },
];

export const DashboardScreen = memo(function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showRecentModePicker, setShowRecentModePicker] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const { snapshot, monthlyRemaining, isPremium, resetLabel } = useInvoiceCredits();
  const {
    data: queryData,
    recentMode,
    setRecentMode,
    isError,
    isRefreshing,
    isEmptyInvoices,
    isEmptyProducts,
    refresh,
    createInvoice,
    createProduct,
    openBusinessProfile,
    openInvoice,
    openProduct,
    openSeeAll,
  } = useDashboard();
  const data = queryData ?? {
    business: {
      name: '',
      monthlyRevenue: 0,
      weeklyRevenue: 0,
      revenueGrowth: 0,
      currencyCode: 'USD',
    },
    recentInvoices: [],
    recentProducts: [],
    quickActions: [],
  };

  const formatCurrency = useCallback(
    (value: number) => {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: data.business.currencyCode,
      }).format(value);
    },
    [data.business.currencyCode],
  );

  const growthBadge = useMemo(() => {
    return (
      <Badge
        label={`+${data.business.revenueGrowth}%`}
        variant="success"
        size="sm"
        icon={({ color, size }) => <Ionicons name="trending-up" color={color} size={size} />}
      />
    );
  }, [data.business.revenueGrowth]);

  const recentTitle =
    RECENT_MODE_OPTIONS.find((option) => option.value === recentMode)?.label ?? 'Recent Invoices';
  const listData = recentMode === 'products' ? data.recentProducts : data.recentInvoices;

  const renderListHeader = useCallback(() => {
    return (
      <View style={[cStyle.g16, cStyle.mb16]}>
        <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.justifyBetween, cStyle.pv8]}>
          <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8]}>
            <View style={[cStyle.p8, cStyle.r12, { backgroundColor: theme.colors.primarySubtle }]}>
              <Ionicons name="receipt-sharp" size={22} color={theme.colors.primary} />
            </View>
            <ThemedText
              style={[
                theme.typography.title,
                cStyle.fontBold,
                { color: theme.colors.textPrimary, fontSize: 20 },
              ]}
            >
              Invoicely
            </ThemedText>
          </View>

          <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8]}>
            <InvoiceCreditIndicator
              remaining={monthlyRemaining}
              isPremium={isPremium}
              onPress={() => setShowUsageModal(true)}
            />
            <IconButton
              icon={({ color, size }) => (
                <Ionicons name="notifications-outline" color={color} size={size} />
              )}
              accessibilityLabel="View notifications"
              onPress={() => undefined}
            />
            <IconButton
              icon={({ color, size }) => (
                <Ionicons name="person-outline" color={color} size={size} />
              )}
              accessibilityLabel="Open business profile"
              onPress={openBusinessProfile}
            />
          </View>
        </View>

        <View style={[cStyle.pv2]}>
          <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Good Morning,
          </ThemedText>
          {data.business.name.length > 0 && (
            <ThemedText
              style={[
                theme.typography.title,
                cStyle.fontBold,
                { color: theme.colors.textPrimary, fontSize: 24, marginTop: 2 },
              ]}
            >
              {data.business.name}
            </ThemedText>
          )}
        </View>

        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(data.business.monthlyRevenue)}
          subtitle="Overall business earnings this month"
          badge={growthBadge}
        />

        <View style={[cStyle.flexRow, cStyle.g12, cStyle.itemCenter]}>
          <AnalyticsCard
            title="This Month"
            value={formatCurrency(data.business.monthlyRevenue)}
            style={cStyle.flex1}
          />
          <AnalyticsCard
            title="This Week"
            value={formatCurrency(data.business.weeklyRevenue)}
            style={cStyle.flex1}
          />
        </View>

        <View style={[cStyle.flexRow, cStyle.g12]}>
          <Button
            label="New Invoice"
            variant="primary"
            size="md"
            style={cStyle.flex1}
            leftIcon={({ color, size }) => <Ionicons name="add-sharp" color={color} size={size} />}
            onPress={createInvoice}
            accessibilityHint="Opens the create invoice screen"
          />
          <Button
            label="Add Product"
            variant="outline"
            size="md"
            style={cStyle.flex1}
            leftIcon={({ color, size }) => (
              <Ionicons name="cube-outline" color={color} size={size} />
            )}
            onPress={createProduct}
            accessibilityHint="Opens the add product form"
          />
        </View>

        <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.justifyBetween, cStyle.pv8]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${recentTitle}. Change recent content`}
            accessibilityHint="Opens recent invoices or recent products options"
            onPress={() => setShowRecentModePicker(true)}
            style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g4, { minHeight: 44 }]}
          >
            <ThemedText
              style={[
                theme.typography.title,
                { color: theme.colors.textPrimary, fontSize: 18, lineHeight: 24 },
              ]}
            >
              {recentTitle}
            </ThemedText>
            <Ionicons name="chevron-down" size={theme.iconSizes.md} color={theme.colors.primary} />
          </Pressable>
          <Pressable
            onPress={openSeeAll}
            accessibilityRole="button"
            accessibilityLabel={`See all ${recentMode === 'products' ? 'products' : 'invoices'}`}
            hitSlop={8}
            style={({ pressed }) => [
              pressed && cStyle.opacity64,
              { minHeight: 44, justifyContent: 'center' },
            ]}
          >
            <ThemedText style={[theme.typography.label, { color: theme.colors.primary }]}>
              See All
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }, [
    createInvoice,
    createProduct,
    data.business.monthlyRevenue,
    data.business.name,
    data.business.weeklyRevenue,
    formatCurrency,
    growthBadge,
    isPremium,
    monthlyRemaining,
    openBusinessProfile,
    openSeeAll,
    recentMode,
    recentTitle,
    theme,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: Invoice | ProductListItem }) => {
      if (recentMode === 'products') {
        const productItem = item as ProductListItem;
        return <ProductCard item={productItem} onPress={openProduct} />;
      }

      const invoice = item as Invoice;
      return (
        <InvoiceCard
          invoiceNumber={invoice.invoiceNumber}
          customerName={invoice.customerName}
          amount={invoice.amount}
          status={invoice.status}
          date={invoice.date}
          onPress={() => openInvoice(invoice.id)}
        />
      );
    },
    [openInvoice, openProduct, recentMode],
  );

  const keyExtractor = useCallback(
    (item: Invoice | ProductListItem) => {
      if (recentMode === 'products') return (item as ProductListItem).product.id;
      return (item as Invoice).id;
    },
    [recentMode],
  );

  const renderEmptyList = useCallback(() => {
    if (recentMode === 'products') {
      return isEmptyProducts ? (
        <View style={[cStyle.pv16]}>
          <EmptyState
            title="No products yet"
            description="Add your first product or service."
            icon={({ color, size }) => <Ionicons name="cube-outline" color={color} size={size} />}
            primaryAction={{ label: 'Add Product', onPress: createProduct }}
          />
        </View>
      ) : null;
    }

    return isEmptyInvoices ? (
      <EmptyState
        title="No invoices yet"
        description="Create your first invoice to see it here."
        primaryAction={{ label: 'New Invoice', onPress: createInvoice }}
      />
    ) : null;
  }, [createInvoice, createProduct, isEmptyInvoices, isEmptyProducts, recentMode]);

  if (isError) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description="Please try again."
        primaryAction={{ label: 'Retry', onPress: refresh }}
      />
    );
  }

  if (queryData == null) {
    return <Loader mode="fullScreen" text="Loading dashboard" />;
  }

  return (
    <View
      style={[
        cStyle.flex1,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingLeft: insets.left + cStyleValues.spacing.lg,
          paddingRight: insets.right + cStyleValues.spacing.lg,
        },
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + cStyleValues.spacing['2xl'],
          gap: cStyleValues.spacing.md,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />

      <Modal
        visible={showRecentModePicker}
        title="Show recent"
        description="Choose what appears in this dashboard section."
        onRequestClose={() => setShowRecentModePicker(false)}
        footer={
          <View style={[cStyle.g8]}>
            {RECENT_MODE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                label={option.label}
                variant={option.value === recentMode ? 'primary' : 'outline'}
                onPress={() => {
                  setRecentMode(option.value);
                  setShowRecentModePicker(false);
                }}
                accessibilityHint={`Shows ${option.label.toLowerCase()} on the dashboard`}
              />
            ))}
          </View>
        }
      />

      <InvoiceUsageModal
        visible={showUsageModal}
        snapshot={snapshot}
        resetLabel={resetLabel}
        onRequestClose={() => setShowUsageModal(false)}
      />
    </View>
  );
});

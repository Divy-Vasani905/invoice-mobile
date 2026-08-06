import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { IconButton } from '@/components/IconButton';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { SummaryCard } from '@/components/layout/SummaryCard';
import { ThemedText } from '@/components/themed-text';
import { useTheme, cStyle } from '@/theme';

import { AnalyticsCard } from '../components/AnalyticsCard';
import { InvoiceCard } from '../components/InvoiceCard';
import { useDashboard } from '../hooks/useDashboard';

import type { Invoice } from '../types/dashboard.types';

export const DashboardScreen = memo(function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    data: queryData,
    isError,
    isRefreshing,
    isEmpty,
    refresh,
    createInvoice,
    openBusinessProfile,
    openInvoice,
    openInvoices,
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
    quickActions: [],
  };

  // Format currency value helper
  const formatCurrency = useCallback(
    (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: data.business.currencyCode,
      }).format(value);
    },
    [data.business.currencyCode],
  );

  // Growth badge component for total revenue card
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

  // List header layout (Top Bar, Greeting, Revenue, Analytics, Button)
  const renderListHeader = useCallback(() => {
    return (
      <View style={[cStyle.g16, cStyle.mb16]}>
        {/* Top App Bar */}
        <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.justifyBetween, cStyle.pv8]}>
          {/* App Logo */}
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

          {/* Top Actions: Notifications + Profile Avatar */}
          <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g12]}>
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

        {/* Greeting Section */}
        <View style={[cStyle.pv4]}>
          <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Good Morning,
          </ThemedText>
          <ThemedText
            style={[
              theme.typography.title,
              cStyle.fontBold,
              { color: theme.colors.textPrimary, fontSize: 24, marginTop: 2 },
            ]}
          >
            {data.business.name}
          </ThemedText>
        </View>

        {/* Revenue Card (reusable SummaryCard) */}
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(data.business.monthlyRevenue)}
          subtitle="Overall business earnings this month"
          badge={growthBadge}
        />

        {/* Analytics Cards Row */}
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

        {/* Primary Action Button */}
        <Button
          label="New Invoice"
          variant="primary"
          size="lg"
          style={cStyle.mv8}
          leftIcon={({ color, size }) => <Ionicons name="add-sharp" color={color} size={size} />}
          onPress={createInvoice}
        />

        {/* Recent Invoices Title */}
        <SectionHeader
          title="Recent Invoices"
          actionLabel="See All"
          onActionPress={openInvoices}
          style={cStyle.ph0} // Align cleanly with the list layout width
        />
      </View>
    );
  }, [
    data.business.name,
    data.business.monthlyRevenue,
    data.business.weeklyRevenue,
    formatCurrency,
    growthBadge,
    createInvoice,
    openBusinessProfile,
    openInvoices,
    theme,
  ]);

  // List item renderer
  const renderItem = useCallback(
    ({ item }: { item: Invoice }) => {
      return (
        <InvoiceCard
          invoiceNumber={item.invoiceNumber}
          customerName={item.customerName}
          amount={item.amount}
          status={item.status}
          date={item.date}
          onPress={() => openInvoice(item.id)}
        />
      );
    },
    [openInvoice],
  );

  // Empty list placeholder component
  const renderEmptyList = useCallback(() => {
    return isEmpty ? (
      <EmptyState
        title="No invoices yet"
        description="Create your first invoice to see it here."
        primaryAction={{ label: 'New Invoice', onPress: createInvoice }}
      />
    ) : null;
  }, [createInvoice, isEmpty]);

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
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
        },
      ]}
    >
      {/* Hide the route layout Stack header inside the view */}
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={data.recentInvoices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
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
    </View>
  );
});

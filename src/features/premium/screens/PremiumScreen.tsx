import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { showToast } from '@/components/feedback/Toast';
import { Card } from '@/components/layout/Card';
import { ThemedText } from '@/components/themed-text';
import { useInvoiceCredits } from '@/features/credits';
import {
  loadPremiumSubscriptionOffering,
  purchasePremiumPackage,
  type PremiumPlanId,
  type PremiumPlanOption,
} from '@/services/revenuecat';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

const PREMIUM_OFFERING_QUERY_KEY = ['premium-offering'] as const;

const BENEFITS = ['Unlimited invoices', 'All invoice templates', 'No ads'] as const;

function offeringUnavailableMessage(
  reason: 'not_initialized' | 'no_current_offering' | 'no_usable_packages' | 'fetch_failed',
): { title: string; description: string } {
  switch (reason) {
    case 'not_initialized':
      return {
        title: 'Premium unavailable',
        description:
          'Purchases are not available on this device right now. Please try again later.',
      };
    case 'no_current_offering':
      return {
        title: 'Plans unavailable',
        description: 'No subscription plans are configured yet. Please try again later.',
      };
    case 'no_usable_packages':
      return {
        title: 'Plans unavailable',
        description: 'Monthly and yearly plans are not available yet. Please try again later.',
      };
    case 'fetch_failed':
    default:
      return {
        title: 'Could not load plans',
        description: 'Check your connection and try again.',
      };
  }
}

const PlanOptionCard = memo(function PlanOptionCard({
  plan,
  selected,
  disabled,
  onSelect,
}: {
  plan: PremiumPlanOption;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const { theme } = useTheme();
  const borderColor = selected ? theme.colors.premium : theme.colors.border;
  const backgroundColor = selected ? theme.colors.premiumSubtle : theme.colors.surface;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`${plan.title} plan, ${plan.priceString} per ${plan.periodLabel}`}
      disabled={disabled}
      onPress={onSelect}
    >
      <Card
        variant="outlined"
        padding="lg"
        style={{
          borderWidth: 2,
          borderColor,
          backgroundColor,
        }}
      >
        <View style={[cStyle.flexRow, cStyle.justifyBetween, cStyle.itemCenter]}>
          <View style={[cStyle.g4, { flex: 1, paddingRight: cStyleValues.spacing.md }]}>
            <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8]}>
              <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
                {plan.title}
              </ThemedText>
              {plan.id === 'yearly' ? (
                <View
                  style={{
                    paddingHorizontal: cStyleValues.spacing.sm,
                    paddingVertical: 2,
                    borderRadius: cStyleValues.radius.full,
                    backgroundColor: theme.colors.premium,
                  }}
                >
                  <ThemedText style={[theme.typography.caption, { color: theme.colors.onPremium }]}>
                    Best value
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
              {plan.priceString}
              <ThemedText style={{ color: theme.colors.textSecondary }}>
                {' '}
                / {plan.periodLabel}
              </ThemedText>
            </ThemedText>
          </View>
          <Ionicons
            name={selected ? 'radio-button-on' : 'radio-button-off'}
            size={theme.iconSizes.lg}
            color={selected ? theme.colors.premium : theme.colors.textTertiary}
          />
        </View>
      </Card>
    </Pressable>
  );
});

export const PremiumScreen = memo(function PremiumScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPremium, invalidateCredits } = useInvoiceCredits();

  const offeringQuery = useQuery({
    queryKey: PREMIUM_OFFERING_QUERY_KEY,
    queryFn: loadPremiumSubscriptionOffering,
    enabled: !isPremium,
    staleTime: 60_000,
  });

  const offering = offeringQuery.data;
  const [selectedPlanId, setSelectedPlanId] = useState<PremiumPlanId | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (offering?.status !== 'ready') return;
    setSelectedPlanId((current) => {
      if (current != null && offering.plans.some((plan) => plan.id === current)) {
        return current;
      }
      return offering.defaultPlanId;
    });
  }, [offering]);

  const selectedPlan = useMemo(() => {
    if (offering?.status !== 'ready' || selectedPlanId == null) return null;
    return offering.plans.find((plan) => plan.id === selectedPlanId) ?? null;
  }, [offering, selectedPlanId]);

  const handlePurchase = useCallback(async () => {
    if (selectedPlan == null || isPurchasing) return;

    setIsPurchasing(true);
    try {
      const result = await purchasePremiumPackage(selectedPlan.rcPackage);
      await invalidateCredits();

      if (result.status === 'cancelled') return;

      if (result.status === 'success') {
        showToast('success', {
          title: "You're Premium",
          message: 'Thanks for upgrading. Enjoy unlimited invoices and more.',
        });
        if (router.canGoBack()) {
          router.back();
        }
        return;
      }

      if (result.status === 'missing_entitlement') {
        showToast('warning', {
          title: 'Purchase received',
          message: 'Premium is not active yet. Please try again in a moment.',
        });
        return;
      }

      showToast('error', {
        title: 'Purchase failed',
        message:
          result.reason === 'not_initialized'
            ? 'Purchases are unavailable right now. Please try again later.'
            : 'Something went wrong. Please try again.',
      });
    } finally {
      setIsPurchasing(false);
    }
  }, [invalidateCredits, isPurchasing, router, selectedPlan]);

  if (isPremium) {
    return (
      <ScrollView
        style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{
          paddingHorizontal: cStyleValues.spacing.lg,
          paddingTop: cStyleValues.spacing.lg,
          paddingBottom: insets.bottom + cStyleValues.spacing['3xl'],
          gap: cStyleValues.spacing.xl,
        }}
      >
        <View
          style={[
            cStyle.p16,
            cStyle.r16,
            cStyle.g12,
            { backgroundColor: theme.colors.premiumSubtle },
          ]}
        >
          <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8]}>
            <Ionicons name="star" size={theme.iconSizes.lg} color={theme.colors.premium} />
            <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
              You&apos;re Premium
            </ThemedText>
          </View>
          <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>
            Your Premium benefits are active on this device.
          </ThemedText>
        </View>

        <View style={[cStyle.g12]}>
          <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
            Included
          </ThemedText>
          {BENEFITS.map((benefit) => (
            <View key={benefit} style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8]}>
              <Ionicons
                name="checkmark-circle"
                size={theme.iconSizes.md}
                color={theme.colors.premium}
              />
              <ThemedText
                style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
              >
                {benefit}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (offeringQuery.isLoading) {
    return (
      <View
        style={[
          cStyle.flex1,
          cStyle.justifyCenter,
          cStyle.itemCenter,
          { backgroundColor: theme.colors.background, padding: cStyleValues.spacing.lg },
        ]}
      >
        <ActivityIndicator color={theme.colors.premium} size="large" />
        <ThemedText
          style={[
            theme.typography.bodyMedium,
            { color: theme.colors.textSecondary, marginTop: cStyleValues.spacing.md },
          ]}
        >
          Loading plans...
        </ThemedText>
      </View>
    );
  }

  if (offering?.status === 'unavailable' || offeringQuery.isError) {
    const copy = offeringUnavailableMessage(
      offering?.status === 'unavailable' ? offering.reason : 'fetch_failed',
    );
    return (
      <View
        style={[
          cStyle.flex1,
          cStyle.justifyCenter,
          cStyle.itemCenter,
          { backgroundColor: theme.colors.background, padding: cStyleValues.spacing.lg },
        ]}
      >
        <EmptyState
          title={copy.title}
          description={copy.description}
          icon={({ color, size }) => (
            <Ionicons name="cloud-offline-outline" color={color} size={size} />
          )}
          primaryAction={{
            label: 'Try again',
            onPress: () => {
              void offeringQuery.refetch();
            },
          }}
        />
      </View>
    );
  }

  if (offering?.status !== 'ready') {
    return null;
  }

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: cStyleValues.spacing.lg,
          paddingTop: cStyleValues.spacing.lg,
          paddingBottom: insets.bottom + cStyleValues.spacing['6xl'],
          gap: cStyleValues.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[cStyle.g8]}>
          <ThemedText style={[theme.typography.headingS, { color: theme.colors.textPrimary }]}>
            Go Premium
          </ThemedText>
          <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>
            Unlock the full Easy Invoice Maker experience.
          </ThemedText>
        </View>

        <View style={[cStyle.g12]}>
          {BENEFITS.map((benefit) => (
            <View key={benefit} style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8]}>
              <Ionicons
                name="checkmark-circle"
                size={theme.iconSizes.md}
                color={theme.colors.premium}
              />
              <ThemedText
                style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
              >
                {benefit}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={[cStyle.g12]}>
          <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
            Choose a plan
          </ThemedText>
          {offering.plans.map((plan) => (
            <PlanOptionCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              disabled={isPurchasing}
              onSelect={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: cStyleValues.spacing.lg,
          paddingTop: cStyleValues.spacing.md,
          paddingBottom: insets.bottom + cStyleValues.spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        }}
      >
        <Button
          label="Continue"
          size="lg"
          loading={isPurchasing}
          disabled={selectedPlan == null || isPurchasing}
          onPress={handlePurchase}
          accessibilityHint="Purchases the selected Premium plan"
        />
      </View>
    </View>
  );
});

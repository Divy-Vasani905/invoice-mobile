import { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Modal } from '@/components/feedback/Modal';
import { ThemedText } from '@/components/themed-text';
import type { RewardedDailyStatus } from '@/services/ads';
import { cStyle, useTheme } from '@/theme';
import type { InvoiceCreditSnapshot } from '@/types/models';

export type InvoiceUsageModalProps = {
  visible: boolean;
  snapshot: InvoiceCreditSnapshot | undefined;
  resetLabel: string;
  onRequestClose: () => void;
  /** When true, Watch Ad is offered (0 credits + under daily limit). */
  canWatchRewarded?: boolean;
  isWatchingAd?: boolean;
  rewardedDaily?: RewardedDailyStatus;
  onWatchAd?: () => void;
  /** Navigate to the existing Premium screen. */
  onPremiumPress?: () => void;
};

function UsageRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.justifyBetween, cStyle.g12]}>
      <ThemedText
        style={[theme.typography.bodySmall, { flex: 1, color: theme.colors.textSecondary }]}
      >
        {label}
      </ThemedText>
      <ThemedText
        style={[
          emphasis ? theme.typography.title : theme.typography.bodySmall,
          cStyle.fontBold,
          { color: theme.colors.textPrimary },
        ]}
      >
        {value}
      </ThemedText>
    </View>
  );
}

/**
 * Single rich Invoice Usage modal used from header, New Invoice gate, FAB, and Invoices.
 */
export const InvoiceUsageModal = memo(function InvoiceUsageModal({
  visible,
  snapshot,
  resetLabel,
  onRequestClose,
  canWatchRewarded = false,
  isWatchingAd = false,
  rewardedDaily,
  onWatchAd,
  onPremiumPress,
}: InvoiceUsageModalProps) {
  const { theme } = useTheme();

  if (snapshot == null) {
    return (
      <Modal
        visible={visible}
        title="Invoice Usage"
        description="Loading usage details…"
        onRequestClose={onRequestClose}
        primaryAction={{ label: 'Close', onPress: onRequestClose }}
      />
    );
  }

  const depleted = !snapshot.isPremium && snapshot.totalAvailable <= 0;
  const dailyLimitReached = rewardedDaily?.hasReachedDailyLimit === true;
  const showWatchAd = depleted && canWatchRewarded && onWatchAd != null;
  const showDisabledWatchAd = !canWatchRewarded && dailyLimitReached && onWatchAd != null;
  const showPremium = !snapshot.isPremium && onPremiumPress != null;
  const showMonetizationRow = showWatchAd || showDisabledWatchAd || showPremium;

  let description = 'Track free monthly invoices and purchased credits.';
  if (depleted && dailyLimitReached) {
    description =
      "You've used all your free invoices for this month. Daily reward limit reached. Try again tomorrow.";
  } else if (depleted) {
    description =
      'You have no invoice credits. You can watch an ad to earn 1 credit or upgrade to Premium.';
  }

  const dailyLabel =
    rewardedDaily != null
      ? `${rewardedDaily.rewardsEarnedToday} / ${rewardedDaily.dailyLimit}`
      : '—';

  return (
    <Modal
      visible={visible}
      title="Invoice Usage"
      description={description}
      size="md"
      closable={!isWatchingAd}
      onRequestClose={onRequestClose}
      footer={
        <View style={[cStyle.g12]}>
          {showMonetizationRow && (
            <View style={[cStyle.flexRow, cStyle.g8, { flexWrap: 'wrap' }]}>
              {(showWatchAd || showDisabledWatchAd) && (
                <Button
                  label={isWatchingAd ? 'Loading…' : 'Watch Ad'}
                  onPress={onWatchAd}
                  loading={isWatchingAd}
                  disabled={isWatchingAd || showDisabledWatchAd}
                  style={[cStyle.flex1, { minWidth: 120 }]}
                />
              )}
              {showPremium && !__DEV__ && (
                <Button
                  label="Go Premium"
                  variant="outline"
                  onPress={onPremiumPress}
                  disabled={isWatchingAd}
                  style={[cStyle.flex1, { minWidth: 120 }]}
                />
              )}
            </View>
          )}
          <Button
            label="Close"
            variant={showMonetizationRow ? 'ghost' : 'primary'}
            onPress={onRequestClose}
            disabled={isWatchingAd}
          />
        </View>
      }
    >
      <View style={[cStyle.g16]}>
        <View
          style={[cStyle.g8, cStyle.p12, cStyle.r12, { backgroundColor: theme.colors.surface }]}
        >
          <ThemedText style={[theme.typography.label, { color: theme.colors.textTertiary }]}>
            Free invoices this month
          </ThemedText>
          <UsageRow label="Used" value={`${snapshot.monthlyUsed} / ${snapshot.monthlyFreeLimit}`} />
          <UsageRow label="Remaining" value={String(snapshot.monthlyRemaining)} emphasis />
        </View>

        <View
          style={[cStyle.g8, cStyle.p12, cStyle.r12, { backgroundColor: theme.colors.surface }]}
        >
          <UsageRow label="Purchased invoice credits" value={String(snapshot.purchasedCredits)} />
          <UsageRow
            label="Total available"
            value={snapshot.isPremium ? 'Unlimited' : String(snapshot.totalAvailable)}
            emphasis
          />
        </View>

        <View
          style={[cStyle.g8, cStyle.p12, cStyle.r12, { backgroundColor: theme.colors.surface }]}
        >
          <UsageRow label="Daily ad rewards" value={dailyLabel} />
        </View>

        <ThemedText style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
          Free invoices reset monthly
          {resetLabel.length > 0 ? ` · Next reset ${resetLabel}` : '.'}
        </ThemedText>
      </View>
    </Modal>
  );
});

import { memo } from 'react';
import { View } from 'react-native';

import { Modal } from '@/components/feedback/Modal';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';
import type { InvoiceCreditSnapshot } from '@/types/models';

export type InvoiceUsageModalProps = {
  visible: boolean;
  snapshot: InvoiceCreditSnapshot | undefined;
  resetLabel: string;
  onRequestClose: () => void;
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
 * Informational invoice usage dialog. Monetization CTAs are intentionally omitted.
 */
export const InvoiceUsageModal = memo(function InvoiceUsageModal({
  visible,
  snapshot,
  resetLabel,
  onRequestClose,
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
  const description = depleted
    ? "You've used all your free invoices for this month. Your free invoice allowance will reset next month."
    : 'Track free monthly invoices and purchased credits.';

  return (
    <Modal
      visible={visible}
      title="Invoice Usage"
      description={description}
      size="md"
      onRequestClose={onRequestClose}
      primaryAction={{ label: 'Close', onPress: onRequestClose }}
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

        <ThemedText style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
          Free invoices reset monthly
          {resetLabel.length > 0 ? ` · Next reset ${resetLabel}` : '.'}
        </ThemedText>
      </View>
    </Modal>
  );
});

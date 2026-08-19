import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Modal } from '@/components/feedback/Modal';
import { Select } from '@/components/form/Select';
import { ThemedText } from '@/components/themed-text';
import {
  NO_TAX_SELECTION_ID,
  SNAPSHOT_TAX_SELECTION_ID,
  formatSavedTaxLabel,
} from '@/features/tax/utils/tax.utils';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';
import type { SavedTaxRate } from '@/types/models';

export interface InvoiceTaxPickerProps {
  visible: boolean;
  taxes: SavedTaxRate[];
  selectedId: string;
  snapshotLabel?: string;
  onClose: () => void;
  onSelect: (tax: SavedTaxRate | null | 'snapshot') => void;
  onOpen: () => void;
  disabled?: boolean;
}

export const InvoiceTaxPicker = memo(function InvoiceTaxPicker({
  visible,
  taxes,
  selectedId,
  snapshotLabel,
  onClose,
  onSelect,
  onOpen,
  disabled = false,
}: InvoiceTaxPickerProps) {
  const { theme } = useTheme();
  const options = [
    { value: NO_TAX_SELECTION_ID, label: 'No Tax' },
    ...(snapshotLabel != null ? [{ value: SNAPSHOT_TAX_SELECTION_ID, label: snapshotLabel }] : []),
    ...taxes.map((tax) => ({ value: tax.id, label: formatSavedTaxLabel(tax) })),
  ];

  return (
    <>
      <Select
        label="Tax"
        placeholder="No Tax"
        options={options}
        value={selectedId}
        onOpen={onOpen}
        disabled={disabled}
        accessibilityLabel="Invoice tax"
      />
      <Modal
        visible={visible}
        onRequestClose={onClose}
        title="Select Tax"
        description="Choose a tax for this invoice, or No Tax."
        secondaryAction={{ label: 'Close', onPress: onClose }}
      >
        <View style={[cStyle.g4]}>
          <Pressable
            onPress={() => {
              onSelect(null);
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="No Tax"
            style={{
              paddingVertical: cStyleValues.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
              No Tax
            </ThemedText>
          </Pressable>
          {snapshotLabel != null ? (
            <Pressable
              onPress={() => {
                onSelect('snapshot');
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel={snapshotLabel}
              style={{
                paddingVertical: cStyleValues.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <ThemedText
                style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
              >
                {snapshotLabel}
              </ThemedText>
              <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Saved on this invoice
              </ThemedText>
            </Pressable>
          ) : null}
          {taxes.map((tax) => (
            <Pressable
              key={tax.id}
              onPress={() => {
                onSelect(tax);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel={formatSavedTaxLabel(tax)}
              style={{
                paddingVertical: cStyleValues.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <ThemedText
                style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
              >
                {formatSavedTaxLabel(tax)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
});

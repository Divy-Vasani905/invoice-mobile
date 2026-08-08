import { memo, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Modal } from '@/components/feedback/Modal';
import { Input } from '@/components/form/Input';
import { TextArea } from '@/components/form/TextArea';
import { cStyle } from '@/theme';

import type { InvoiceFormItemValues } from '../types/invoice.types';

export interface InvoiceItemEditorProps {
  visible: boolean;
  item: InvoiceFormItemValues | null;
  onClose: () => void;
  onSave: (item: InvoiceFormItemValues) => void;
}

export const InvoiceItemEditor = memo(function InvoiceItemEditor({
  visible,
  item,
  onClose,
  onSave,
}: InvoiceItemEditorProps) {
  const [draft, setDraft] = useState<InvoiceFormItemValues | null>(item);

  useEffect(() => {
    setDraft(item);
  }, [item]);

  if (draft == null) {
    return (
      <Modal visible={visible} onRequestClose={onClose} title="Edit Item" size="lg">
        <View />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title="Edit Item"
      description="Update line item details. Totals recalculate automatically."
      size="lg"
      primaryAction={{
        label: 'Save Item',
        onPress: () => onSave(draft),
      }}
      secondaryAction={{ label: 'Cancel', onPress: onClose }}
    >
      <View style={[cStyle.g12]}>
        <Input
          label="Name / Description"
          required
          value={draft.name}
          onChangeText={(name) => setDraft({ ...draft, name })}
          placeholder="Item name"
          accessibilityLabel="Item name"
        />
        <TextArea
          label="Details"
          value={draft.description}
          onChangeText={(description) => setDraft({ ...draft, description })}
          placeholder="Optional details"
          accessibilityLabel="Item details"
        />
        <View style={[cStyle.flexRow, cStyle.g12]}>
          <View style={cStyle.flex1}>
            <Input
              label="Quantity"
              required
              value={draft.quantity}
              onChangeText={(quantity) => setDraft({ ...draft, quantity })}
              keyboardType="decimal-pad"
              accessibilityLabel="Quantity"
            />
          </View>
          <View style={cStyle.flex1}>
            <Input
              label="Unit"
              required
              value={draft.unit}
              onChangeText={(unit) => setDraft({ ...draft, unit })}
              accessibilityLabel="Unit"
            />
          </View>
        </View>
        <Input
          label="Unit Price"
          required
          value={draft.unitPrice}
          onChangeText={(unitPrice) => setDraft({ ...draft, unitPrice })}
          keyboardType="decimal-pad"
          accessibilityLabel="Unit price"
        />
        <View style={[cStyle.flexRow, cStyle.g12]}>
          <View style={cStyle.flex1}>
            <Input
              label="Tax %"
              value={draft.taxRate}
              onChangeText={(taxRate) => setDraft({ ...draft, taxRate })}
              keyboardType="decimal-pad"
              accessibilityLabel="Tax rate percent"
            />
          </View>
          <View style={cStyle.flex1}>
            <Input
              label="Discount"
              value={draft.discount}
              onChangeText={(discount) => setDraft({ ...draft, discount })}
              keyboardType="decimal-pad"
              accessibilityLabel="Discount amount"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});

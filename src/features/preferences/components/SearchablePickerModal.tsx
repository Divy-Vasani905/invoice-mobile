import { FlashList } from '@shopify/flash-list';
import { memo, useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
// import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { SearchInput } from '@/components/form/SearchInput';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

export type SearchablePickerItem = {
  id: string;
  title: string;
  subtitle?: string;
};

export type SearchablePickerModalProps = {
  visible: boolean;
  title: string;
  searchPlaceholder: string;
  items: SearchablePickerItem[];
  selectedId: string | null;
  emptyLabel?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export const SearchablePickerModal = memo(function SearchablePickerModal({
  visible,
  title,
  searchPlaceholder,
  items,
  selectedId,
  emptyLabel = 'No matches found.',
  onSelect,
  onClose,
}: SearchablePickerModalProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (normalized.length === 0) return items;
    return items.filter((item) =>
      [item.id, item.title, item.subtitle].some((value) =>
        value?.toLocaleLowerCase().includes(normalized),
      ),
    );
  }, [items, query]);

  const renderItem = useCallback(
    ({ item }: { item: SearchablePickerItem }) => {
      const selected = item.id === selectedId;
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={item.title}
          onPress={() => {
            onSelect(item.id);
            setQuery('');
            onClose();
          }}
          style={[
            cStyle.flexRow,
            cStyle.itemCenter,
            cStyle.justifyBetween,
            cStyle.ph16,
            cStyle.pv12,
            cStyle.r12,
            cStyle.mt8,
            {
              minHeight: theme.buttons.sizes.md.minHeight,
              backgroundColor: selected ? theme.colors.primarySubtle : theme.colors.surface,
              borderWidth: 1,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <View style={[cStyle.flex1, cStyle.pr12]}>
            <ThemedText
              style={[
                theme.typography.bodyMedium,
                { color: selected ? theme.colors.primary : theme.colors.textPrimary },
              ]}
            >
              {item.title}
            </ThemedText>
            {item.subtitle != null && (
              <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {item.subtitle}
              </ThemedText>
            )}
          </View>
          {selected ? (
            <ThemedText style={[theme.typography.label, { color: theme.colors.primary }]}>
              Selected
            </ThemedText>
          ) : null}
        </Pressable>
      );
    },
    [onClose, onSelect, selectedId, theme],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          cStyle.flex1,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={[cStyle.ph16, cStyle.pt12, cStyle.g12]}>
          <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
            {title}
          </ThemedText>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            accessibilityLabel={searchPlaceholder}
          />
        </View>

        <FlashList
          data={filtered}
          renderItem={renderItem}
          extraData={selectedId}
          keyExtractor={(item) => item.id}
          drawDistance={250}
          keyboardShouldPersistTaps="handled"
          style={cStyle.flex1}
          contentContainerStyle={{
            paddingHorizontal: cStyleValues.spacing.lg,
            paddingBottom: cStyleValues.spacing['3xl'],
          }}
          ListEmptyComponent={
            <ThemedText
              style={[
                theme.typography.bodySmall,
                cStyle.textCenter,
                cStyle.mt24,
                { color: theme.colors.textSecondary },
              ]}
            >
              {emptyLabel}
            </ThemedText>
          }
        />

        <View style={[cStyle.ph16, cStyle.pb12]}>
          <Button label="Close" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
});

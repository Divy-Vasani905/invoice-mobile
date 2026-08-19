import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { showToast } from '@/components/feedback/Toast';
import { Header } from '@/components/layout/Header';
import { ListItem } from '@/components/layout/ListItem';
import { formatCurrencyLabel, getCurrencyOptions } from '@/features/preferences/catalog';
import { SearchablePickerModal } from '@/features/preferences/components/SearchablePickerModal';
import { useUserPreferencesStore } from '@/stores/user-preferences';
import { cStyle, useTheme } from '@/theme';

export function CurrencySettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const currencyCode = useUserPreferencesStore((state) => state.currencyCode);
  const setCurrencyCode = useUserPreferencesStore((state) => state.setCurrencyCode);
  const [showPicker, setShowPicker] = useState(false);

  const items = useMemo(
    () =>
      getCurrencyOptions().map((currency) => ({
        id: currency.code,
        title: `${currency.symbol}  ${currency.code} — ${currency.name}`,
      })),
    [],
  );

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header title="Currency" onBack={() => router.back()} />
      <View style={[cStyle.p16]}>
        <ListItem
          title="Preferred currency"
          subtitle={currencyCode == null ? 'Not set' : formatCurrencyLabel(currencyCode)}
          pressable
          onPress={() => setShowPicker(true)}
          accessibilityHint="Opens the currency picker"
        />
      </View>
      <SearchablePickerModal
        visible={showPicker}
        title="Select currency"
        searchPlaceholder="Search currency..."
        items={items}
        selectedId={currencyCode}
        onClose={() => setShowPicker(false)}
        onSelect={(code) => {
          try {
            setCurrencyCode(code);
            showToast('success', { title: 'Currency updated' });
          } catch {
            showToast('error', {
              title: 'Could not save currency',
              message: 'Please try again.',
            });
          }
        }}
      />
    </View>
  );
}

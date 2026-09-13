import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Switch } from '@/components/form/Switch';
import { Header } from '@/components/layout/Header';
import { ListItem } from '@/components/layout/ListItem';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { useUserPreferencesStore } from '@/stores/user-preferences';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';
import type { PaymentReminderType } from '@/types/models/user-preferences';

const REMINDER_TYPE_ROWS: {
  type: PaymentReminderType;
  label: string;
}[] = [
  { type: '7_DAYS_BEFORE', label: '7 days before' },
  { type: '2_DAYS_BEFORE', label: '2 days before' },
  { type: 'DUE_DATE', label: 'Due date' },
  { type: '1_DAY_AFTER', label: '1 day after due date' },
  { type: '3_DAYS_AFTER', label: '3 days after' },
  { type: '7_DAYS_AFTER', label: '7 days after' },
];

export function PaymentRemindersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const paymentReminderSettings = useUserPreferencesStore((state) => state.paymentReminderSettings);
  const setPaymentReminderEnabled = useUserPreferencesStore(
    (state) => state.setPaymentReminderEnabled,
  );
  const setPaymentReminderTypeEnabled = useUserPreferencesStore(
    (state) => state.setPaymentReminderTypeEnabled,
  );

  const masterEnabled = paymentReminderSettings.enabled;

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header title="Reminders" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          gap: cStyleValues.spacing.xl,
          padding: cStyleValues.spacing.lg,
          paddingBottom: insets.bottom + cStyleValues.spacing['3xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Master Setting">
          <ListItem
            title="Remind me about this payment"
            divider={false}
            trailing={
              <Switch
                value={masterEnabled}
                onValueChange={setPaymentReminderEnabled}
                accessibilityLabel="Remind me about this payment"
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Reminders">
          {REMINDER_TYPE_ROWS.map((row, index) => {
            const isEnabled = paymentReminderSettings.enabledTypes[row.type];
            const isLast = index === REMINDER_TYPE_ROWS.length - 1;

            return (
              <ListItem
                key={row.type}
                title={row.label}
                disabled={!masterEnabled}
                divider={!isLast}
                trailing={
                  <Switch
                    value={isEnabled}
                    disabled={!masterEnabled}
                    onValueChange={(val) => setPaymentReminderTypeEnabled(row.type, val)}
                    accessibilityLabel={row.label}
                  />
                }
              />
            );
          })}
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

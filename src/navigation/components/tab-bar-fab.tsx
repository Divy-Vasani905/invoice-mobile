import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { InvoiceUsageModal, useCreateInvoiceNavigation } from '@/features/credits';
import { useResponsiveNavigation } from '@/navigation/hooks/use-responsive-navigation';
import { cStyle, useTheme } from '@/theme';

export type TabBarFabProps = {
  /** Destination opened instead of switching to the placeholder tab. */
  destination: Href;
  label: string;
  testID?: string;
};

/**
 * Centre tab slot rendered as a floating action button.
 *
 * The underlying route exists only so the tab bar reserves a slot for it.
 * Pressing the button opens the create-invoice modal rather than focusing the
 * tab, which keeps the user's current tab intact behind the modal.
 */
export function TabBarFab({ destination: _destination, label, testID }: TabBarFabProps) {
  const { openCreateInvoice, usageModalProps } = useCreateInvoiceNavigation();
  const { colors, elevation } = useTheme();
  const { fabSize, fabLift, tabIconSize } = useResponsiveNavigation();

  return (
    <View style={[cStyle.flex1, cStyle.itemCenter, cStyle.justifyStart]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={openCreateInvoice}
        style={({ pressed }) => [
          cStyle.itemCenter,
          cStyle.justifyCenter,
          elevation.lg,
          pressed && cStyle.opacity80,
          {
            width: fabSize,
            height: fabSize,
            marginTop: -fabLift,
            borderRadius: fabSize / 2,
            backgroundColor: colors.primary,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Ionicons name="add" size={tabIconSize} color={colors.onPrimary} />
      </Pressable>

      <InvoiceUsageModal {...usageModalProps} />
    </View>
  );
}

import { memo } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppUpdateModal } from '@/features/app-update/components/AppUpdateModal';
import { useAppUpdatePrompt } from '@/features/app-update/hooks/useAppUpdatePrompt';
import { useRemoteConfigStore } from '@/stores/remote-config/remote-config-store';
import { useTheme } from '@/theme';

/**
 * Global app gates driven by Remote Config + store version check.
 * Mount once near the app root (alongside ToastHost).
 */
export const AppConfigGates = memo(function AppConfigGates() {
  const { theme } = useTheme();
  const allowAppUsage = useRemoteConfigStore((s) => s.globalConfig.allowAppUsage);
  const update = useAppUpdatePrompt();

  if (!allowAppUsage) {
    return (
      <View
        accessibilityViewIsModal
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1000,
          backgroundColor: theme.colors.background,
          padding: theme.cards.layout.padding,
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <ThemedText style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
          App temporarily unavailable
        </ThemedText>
        <ThemedText style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
          Easy Invoice Maker is temporarily unavailable. Please try again later.
        </ThemedText>
      </View>
    );
  }

  return (
    <AppUpdateModal
      visible={update.visible}
      isForced={update.isForced}
      onLater={update.onLater}
      onUpdate={update.onUpdate}
      onRequestClose={update.onRequestClose}
    />
  );
});

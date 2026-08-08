import { View } from 'react-native';

import { Card } from '@/components/layout/Card';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';

import type { ReactNode } from 'react';

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={[cStyle.g8]}>
      <ThemedText
        style={[
          theme.typography.caption,
          cStyle.fontSemiBold,
          {
            color: theme.colors.textSecondary,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          },
        ]}
        accessibilityRole="header"
      >
        {title}
      </ThemedText>
      <Card variant="outlined" padding="none">
        {children}
      </Card>
    </View>
  );
}

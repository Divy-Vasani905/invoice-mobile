import { memo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/components/layout/Card';
import { ThemedText } from '@/components/themed-text';
import { useTheme, cStyle } from '@/theme';

export interface AnalyticsCardProps {
  /** Metric title (e.g., "This Month") */
  title: string;
  /** Formatted metric value (e.g., "$8,240.00") */
  value: string;
  /** Container style overrides */
  style?: StyleProp<ViewStyle>;
}

export const AnalyticsCard = memo(function AnalyticsCard({
  title,
  value,
  style,
}: AnalyticsCardProps) {
  const { theme } = useTheme();

  return (
    <Card variant="outlined" padding="md" style={style}>
      <View style={[cStyle.g4]}>
        <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          {title}
        </ThemedText>
        <ThemedText
          style={[
            theme.typography.title,
            cStyle.fontBold,
            { color: theme.colors.textPrimary, fontSize: 20, lineHeight: 26 },
          ]}
        >
          {value}
        </ThemedText>
      </View>
    </Card>
  );
});

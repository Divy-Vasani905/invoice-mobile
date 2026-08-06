import { memo } from 'react';
import { Image, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/theme';

import type { EmptyStateProps } from './types';

/** Generic no-content feedback with optional visual and actions. */
export const EmptyState = memo(function EmptyState({
  title,
  description,
  icon,
  image,
  primaryAction,
  secondaryAction,
  style,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View
      accessibilityRole="summary"
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.cards.layout.gap,
          padding: theme.cards.layout.padding,
        },
        style,
      ]}
    >
      {image != null ? (
        <Image
          source={image}
          style={{ width: theme.avatarSizes['3xl'], height: theme.avatarSizes['3xl'] }}
        />
      ) : (
        icon?.({ color: theme.colors.textTertiary, size: theme.iconSizes['3xl'] })
      )}
      <Text
        style={[theme.typography.title, { color: theme.colors.textPrimary, textAlign: 'center' }]}
      >
        {title}
      </Text>
      {description != null && (
        <Text
          style={[
            theme.typography.bodySmall,
            { color: theme.colors.textSecondary, textAlign: 'center' },
          ]}
        >
          {description}
        </Text>
      )}
      {primaryAction != null && <Button {...primaryAction} />}
      {secondaryAction != null && <Button {...secondaryAction} variant="ghost" />}
    </View>
  );
});

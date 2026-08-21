import { memo } from 'react';
import { Easing, Text, View } from 'react-native';
import ToastMessage from 'react-native-toast-message';

import { useTheme } from '@/theme';

import type { ToastOptions, ToastVariant } from './types';

/** Mount once near the application root to render themed toast notifications. */
export const ToastHost = memo(function ToastHost() {
  const { theme } = useTheme();

  return (
    <ToastMessage
      animationConfig={{
        enter: {
          type: 'timing',
          duration: theme.animation.duration.slow,
          easing: Easing.out(Easing.cubic),
        },
        exit: {
          type: 'timing',
          duration: theme.animation.duration.normal,
          easing: Easing.in(Easing.cubic),
        },
      }}
      config={{
        success: (props) => <ToastCard {...props} variant="success" />,
        error: (props) => <ToastCard {...props} variant="error" />,
        warning: (props) => <ToastCard {...props} variant="warning" />,
        info: (props) => <ToastCard {...props} variant="info" />,
      }}
    />
  );

  function ToastCard({
    text1,
    text2,
    variant,
  }: {
    text1?: string;
    text2?: string;
    variant: ToastVariant;
  }) {
    const color =
      variant === 'success'
        ? theme.colors.success
        : variant === 'error'
          ? theme.colors.danger
          : variant === 'warning'
            ? theme.colors.warning
            : theme.colors.info;
    return (
      <View
        accessibilityRole="alert"
        style={[
          theme.elevation.md,
          {
            gap: theme.inputs.layout.gap,
            padding: theme.cards.layout.paddingCompact,
            borderRadius: theme.cards.layout.radius,
            backgroundColor: theme.colors.surfaceRaised,
            borderWidth: 1,
            borderColor: color,
            overflow: 'hidden',
          },
        ]}
      >
        {text1 != null && <Text style={[theme.typography.label, { color }]}>{text1}</Text>}
        {text2 != null && (
          <Text style={[theme.typography.helper, { color: theme.colors.textSecondary }]}>
            {text2}
          </Text>
        )}
      </View>
    );
  }
});

/** Imperative notification API; mount `ToastHost` once before calling it. */
export function showToast(variant: ToastVariant, options: ToastOptions): void {
  ToastMessage.show({
    type: variant,
    text1: options.title,
    text2: options.message,
    visibilityTime: options.duration,
    position: options.position,
    props: { actionLabel: options.actionLabel, onAction: options.onAction },
  });
}

export function hideToast(): void {
  ToastMessage.hide();
}

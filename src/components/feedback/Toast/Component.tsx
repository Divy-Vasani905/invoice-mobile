import { memo } from 'react';
import { Text, View } from 'react-native';
import ToastMessage from 'react-native-toast-message';

import { useTheme } from '@/theme';

import type { ToastOptions, ToastVariant } from './types';

/** Mount once near the application root to render themed toast notifications. */
export const ToastHost = memo(function ToastHost() {
  const { theme } = useTheme();

  return (
    <ToastMessage
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
    const background =
      variant === 'success'
        ? theme.colors.successSubtle
        : variant === 'error'
          ? theme.colors.dangerSubtle
          : variant === 'warning'
            ? theme.colors.warningSubtle
            : theme.colors.infoSubtle;

    return (
      <View
        accessibilityRole="alert"
        style={{
          gap: theme.inputs.layout.gap,
          padding: theme.cards.layout.paddingCompact,
          borderRadius: theme.cards.layout.radius,
          backgroundColor: background,
        }}
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

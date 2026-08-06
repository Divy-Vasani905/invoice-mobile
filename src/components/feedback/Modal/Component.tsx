import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Modal as NativeModal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Loader } from '@/components/feedback/Loader';
import { useTheme } from '@/theme';

import type { FeedbackModalProps } from './types';

const modalWidthBySize = {
  sm: 'xl',
  md: '2xl',
  lg: '3xl',
} as const;

/** Theme-aware modal wrapper for custom, confirmation, and destructive dialogs. */
export const Modal = memo(function Modal({
  title,
  description,
  children,
  footer,
  primaryAction,
  secondaryAction,
  closable = true,
  loading = false,
  size = 'md',
  variant = 'default',
  contentStyle,
  onRequestClose,
  visible,
  animationType = 'fade',
}: FeedbackModalProps) {
  const { theme } = useTheme();
  const maxWidth = theme.avatarSizes[modalWidthBySize[size]];
  const primaryVariant = variant === 'destructive' ? 'danger' : 'primary';

  return (
    <NativeModal
      transparent
      visible={visible}
      animationType={animationType}
      onRequestClose={onRequestClose}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.cards.layout.padding,
          backgroundColor: theme.colors.scrim,
        }}
      >
        <View
          accessibilityViewIsModal
          style={[
            {
              width: '100%',
              maxWidth,
              gap: theme.cards.layout.gap,
              padding: theme.cards.layout.padding,
              borderRadius: theme.cards.layout.radius,
              backgroundColor: theme.colors.modal,
            },
            contentStyle,
          ]}
        >
          {(title != null || closable) && (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: theme.inputs.layout.gap }}
            >
              {title != null && (
                <Text
                  style={[theme.typography.title, { flex: 1, color: theme.colors.textPrimary }]}
                >
                  {title}
                </Text>
              )}
              {closable && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close dialog"
                  onPress={onRequestClose}
                >
                  <Ionicons
                    name="close"
                    color={theme.colors.textSecondary}
                    size={theme.iconSizes.lg}
                  />
                </Pressable>
              )}
            </View>
          )}
          {description != null && (
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>
          )}
          {children}
          {loading && <Loader text="Loading" />}
          {footer ?? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: theme.inputs.layout.gap,
              }}
            >
              {secondaryAction != null && <Button {...secondaryAction} variant="ghost" />}
              {primaryAction != null && <Button {...primaryAction} variant={primaryVariant} />}
            </View>
          )}
        </View>
      </View>
    </NativeModal>
  );
});

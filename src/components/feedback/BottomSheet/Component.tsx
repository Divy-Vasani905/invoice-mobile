import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheetNative, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import type { FeedbackBottomSheetProps } from './types';

/**
 * Token-themed Gorhom sheet wrapper with dynamic sizing, optional scrolling,
 * backdrop, keyboard behavior, header, close action, and footer content.
 */
export const BottomSheet = memo(
  forwardRef<BottomSheetNative, FeedbackBottomSheetProps>(function FeedbackBottomSheet(
    { title, children, footer, closable = true, scrollable = false, onClose, ...props },
    ref,
  ) {
    const { theme } = useTheme();

    const content = (
      <View style={{ gap: theme.cards.layout.gap, padding: theme.cards.layout.padding }}>
        {(title != null || closable) && (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.inputs.layout.gap }}
          >
            {title != null && (
              <Text style={[theme.typography.title, { flex: 1, color: theme.colors.textPrimary }]}>
                {title}
              </Text>
            )}
            {closable && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close bottom sheet"
                onPress={() => {
                  if (typeof ref !== 'function') ref?.current?.close();
                }}
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
        {children}
        {footer}
      </View>
    );

    return (
      <BottomSheetNative
        {...props}
        ref={ref}
        enableDynamicSizing={props.enableDynamicSizing ?? props.snapPoints == null}
        keyboardBehavior={props.keyboardBehavior ?? 'interactive'}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.borderStrong }}
        onClose={onClose}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop {...backdropProps} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
      >
        {scrollable ? (
          <BottomSheetScrollView>{content}</BottomSheetScrollView>
        ) : (
          <BottomSheetView>{content}</BottomSheetView>
        )}
      </BottomSheetNative>
    );
  }),
);

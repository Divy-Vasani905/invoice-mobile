import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useRef, useState } from 'react';
import { Modal, Pressable, Text, View, type LayoutRectangle } from 'react-native';

import { getFieldStyles, resolveFieldState } from '@/components/form/shared/styles';
import { useTheme } from '@/theme';

export interface DiscountTypeOption {
  value: string;
  label: string;
}

interface DiscountTypeSelectProps {
  options: readonly DiscountTypeOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  errorMessage?: string;
  accessibilityLabel?: string;
}

/**
 * A self-contained inline dropdown for Discount Type.
 * Unlike the shared bottom-sheet approach used for Unit/Currency, this
 * renders a popover anchored directly below the trigger field so it is
 * always visually attached regardless of scroll position.
 */
export const DiscountTypeSelect = memo(function DiscountTypeSelect({
  options,
  value,
  onChange,
  label,
  errorMessage,
  accessibilityLabel,
}: DiscountTypeSelectProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);
  const triggerRef = useRef<View>(null);

  const state = resolveFieldState(false, focused || open, errorMessage != null);
  const styles = getFieldStyles(theme, state, 'md');
  const selectedLabel = options.find((o) => o.value === value)?.label;

  const handleOpen = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      setOpen(true);
    });
  }, []);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setOpen(false);
    },
    [onChange],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <View style={styles.container}>
      {label != null && <Text style={styles.label}>{label}</Text>}

      {/* Trigger row */}
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint="Opens a selection list"
          accessibilityState={{ expanded: open }}
          onPress={handleOpen}
          onPressIn={() => setFocused(true)}
          onPressOut={() => setFocused(false)}
          style={styles.control}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.input,
              {
                color:
                  selectedLabel == null
                    ? theme.colors.textPlaceholder
                    : (styles.input.color as string),
              },
            ]}
          >
            {selectedLabel ?? 'Select discount type'}
          </Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            color={styles.iconColor}
            size={styles.iconSize}
            accessible={false}
          />
        </Pressable>
      </View>

      {errorMessage != null && (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      )}

      {/* Inline popover rendered via a transparent Modal to overlay scroll content */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        {/* Full-screen backdrop closes dropdown on outside tap */}
        <Pressable style={{ flex: 1 }} onPress={handleClose} accessible={false}>
          {/* The anchored dropdown panel */}
          {layout != null && (
            <View
              style={{
                position: 'absolute',
                top: layout.y + layout.height + 4,
                left: layout.x,
                width: layout.width,
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                // Shadow for elevation
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 8,
                overflow: 'hidden',
              }}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isLast = index === options.length - 1;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    accessibilityRole="menuitem"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: pressed
                        ? theme.colors.backgroundSubtle
                        : isSelected
                          ? theme.colors.backgroundSubtle
                          : theme.colors.surface,
                      borderBottomWidth: isLast ? 0 : 1,
                      borderBottomColor: theme.colors.border,
                    })}
                  >
                    <Text
                      style={[
                        {
                          flex: 1,
                          fontSize: 15,
                          color: isSelected ? theme.colors.primary : theme.colors.textPrimary,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={theme.colors.primary}
                        accessible={false}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
});

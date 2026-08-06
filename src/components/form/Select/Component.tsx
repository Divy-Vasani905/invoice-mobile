import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getFieldStyles, resolveFieldState } from '@/components/form/shared/styles';
import { useTheme } from '@/theme';

import type { SelectProps } from './types';

/**
 * Controlled select trigger. It resolves the selected label but delegates
 * opening and selection UI to `onOpen`, keeping it ready for a future bottom
 * sheet without coupling this foundation component to one.
 */
export const Select = memo(function Select({
  options,
  value,
  onOpen,
  label,
  placeholder,
  helperText,
  errorMessage,
  required = false,
  disabled = false,
  searchable = false,
  size = 'md',
  containerStyle,
  valueStyle,
  accessibilityLabel,
  ...viewProps
}: SelectProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const state = resolveFieldState(disabled, focused, errorMessage != null);
  const styles = getFieldStyles(theme, state, size);
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const displayValue = selectedLabel ?? placeholder;

  return (
    <View {...viewProps} style={[styles.container, containerStyle]}>
      {label != null && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
        accessibilityHint={
          searchable ? 'Opens a searchable selection list' : 'Opens a selection list'
        }
        accessibilityState={{ disabled, expanded: focused }}
        disabled={disabled}
        onPress={onOpen}
        onPressIn={() => setFocused(true)}
        onPressOut={() => setFocused(false)}
        style={styles.control}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.input,
            { color: selectedLabel == null ? theme.colors.textPlaceholder : styles.input.color },
            valueStyle,
          ]}
        >
          {displayValue}
        </Text>
        <Ionicons
          name="chevron-down"
          color={styles.iconColor}
          size={styles.iconSize}
          accessible={false}
        />
      </Pressable>
      {errorMessage != null ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : (
        helperText != null && <Text style={styles.helper}>{helperText}</Text>
      )}
    </View>
  );
});

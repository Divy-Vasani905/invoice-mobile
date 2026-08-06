import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, memo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { getFieldStyles, resolveFieldState } from '@/components/form/shared/styles';
import { useTheme } from '@/theme';

import type { InputProps } from './types';

/**
 * Theme-aware single-line field that can be controlled by React Hook Form's
 * `Controller` or used directly through standard `TextInput` props.
 */
export const Input = memo(
  forwardRef<TextInput, InputProps>(function Input(
    {
      label,
      helperText,
      errorMessage,
      required = false,
      disabled = false,
      readOnly = false,
      size = 'md',
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      clearable = false,
      onClear,
      showCharacterCount = false,
      containerStyle,
      inputStyle,
      value,
      onChangeText,
      onFocus,
      onBlur,
      maxLength,
      accessibilityLabel,
      ...textInputProps
    },
    ref,
  ) {
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);
    const state = resolveFieldState(disabled, focused, errorMessage != null);
    const styles = getFieldStyles(theme, state, size);
    const textValue = value ?? '';
    const canClear = clearable && !disabled && !readOnly && textValue.length > 0;

    const clear = () => {
      if (onClear != null) {
        onClear();
        return;
      }

      onChangeText?.('');
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label != null && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        <View style={styles.control}>
          {leftIcon?.({ color: styles.iconColor, size: styles.iconSize })}
          {prefix != null && <Text style={styles.adornment}>{prefix}</Text>}
          <TextInput
            {...textInputProps}
            ref={ref}
            value={value}
            maxLength={maxLength}
            editable={!disabled && !readOnly}
            accessibilityLabel={accessibilityLabel ?? label ?? textInputProps.placeholder}
            accessibilityHint={errorMessage ?? helperText}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onChangeText={onChangeText}
            placeholderTextColor={theme.colors[theme.inputs.states[state].placeholder]}
            style={[styles.input, inputStyle]}
          />
          {suffix != null && <Text style={styles.adornment}>{suffix}</Text>}
          {canClear && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear text"
              onPress={clear}
              hitSlop={theme.buttons.sizes.sm.paddingHorizontal}
            >
              <Ionicons name="close-circle" color={styles.iconColor} size={styles.iconSize} />
            </Pressable>
          )}
          {rightIcon?.({ color: styles.iconColor, size: styles.iconSize })}
        </View>
        {errorMessage != null ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {errorMessage}
          </Text>
        ) : (
          helperText != null && <Text style={styles.helper}>{helperText}</Text>
        )}
        {showCharacterCount && maxLength != null && (
          <Text style={styles.helper}>
            {textValue.length}/{maxLength}
          </Text>
        )}
      </View>
    );
  }),
);

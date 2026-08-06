import { forwardRef, memo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { getFieldStyles, resolveFieldState } from '@/components/form/shared/styles';
import { useTheme } from '@/theme';

import type { TextAreaProps } from './types';

/**
 * Multi-line field with optional automatic height growth and tokenized
 * label, helper, error, and character-count presentation.
 */
export const TextArea = memo(
  forwardRef<TextInput, TextAreaProps>(function TextArea(
    {
      label,
      helperText,
      errorMessage,
      required = false,
      disabled = false,
      size = 'md',
      autoGrow = false,
      showCharacterCount = false,
      containerStyle,
      inputStyle,
      value,
      maxLength,
      onFocus,
      onBlur,
      onContentSizeChange,
      accessibilityLabel,
      ...textInputProps
    },
    ref,
  ) {
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);
    const [contentHeight, setContentHeight] = useState<number>();
    const state = resolveFieldState(disabled, focused, errorMessage != null);
    const styles = getFieldStyles(theme, state, size);
    const minHeight = theme.buttons.sizes[size].minHeight;
    const inputHeight = autoGrow ? Math.max(minHeight, contentHeight ?? minHeight) : undefined;
    const textValue = value ?? '';

    return (
      <View style={[styles.container, containerStyle]}>
        {label != null && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        <View style={styles.control}>
          <TextInput
            {...textInputProps}
            ref={ref}
            value={value}
            maxLength={maxLength}
            multiline
            editable={!disabled}
            scrollEnabled={!autoGrow}
            accessibilityLabel={accessibilityLabel ?? label ?? textInputProps.placeholder}
            accessibilityHint={errorMessage ?? helperText}
            placeholderTextColor={theme.colors[theme.inputs.states[state].placeholder]}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onContentSizeChange={(event) => {
              if (autoGrow) setContentHeight(event.nativeEvent.contentSize.height);
              onContentSizeChange?.(event);
            }}
            style={[styles.input, { height: inputHeight }, inputStyle]}
          />
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

import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, memo, useCallback, useEffect, useState } from 'react';
import { Pressable, TextInput } from 'react-native';

import { Input } from '../Input';

import type { NumberStepperInputProps } from './types';

export const NumberStepperInput = memo(
  forwardRef<TextInput, NumberStepperInputProps>(function NumberStepperInput(
    {
      value,
      onChangeValue,
      step = 1,
      min = 0,
      max,
      decimalPlaces = 0,
      disabled = false,
      readOnly = false,
      inputStyle,
      onBlur,
      ...props
    },
    ref,
  ) {
    const [localValue, setLocalValue] = useState(() => value?.toString() ?? '');

    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value.toString());
      }
    }, [value]);

    const numValue = parseFloat(localValue || '0');

    const formatNumber = useCallback(
      (num: number) => {
        let clamped = num;
        if (min !== undefined && clamped < min) clamped = min;
        if (max !== undefined && clamped > max) clamped = max;
        // toFixed formats with decimal places and rounds safely
        return clamped.toFixed(decimalPlaces);
      },
      [min, max, decimalPlaces],
    );

    const isMinReached = min !== undefined && !isNaN(numValue) && numValue <= min;
    const isMaxReached = max !== undefined && !isNaN(numValue) && numValue >= max;

    const handleIncrement = useCallback(() => {
      if (disabled || readOnly || isMaxReached) return;
      const current = isNaN(numValue) ? (min ?? 0) : numValue;
      const next = current + step;
      const formatted = formatNumber(next);
      setLocalValue(formatted);
      onChangeValue?.(formatted);
    }, [disabled, readOnly, isMaxReached, numValue, min, step, formatNumber, onChangeValue]);

    const handleDecrement = useCallback(() => {
      if (disabled || readOnly || isMinReached) return;
      const current = isNaN(numValue) ? (min ?? 0) : numValue;
      const next = current - step;
      const formatted = formatNumber(next);
      setLocalValue(formatted);
      onChangeValue?.(formatted);
    }, [disabled, readOnly, isMinReached, numValue, min, step, formatNumber, onChangeValue]);

    const handleChangeText = useCallback(
      (text: string) => {
        setLocalValue(text);
        if (text === '') {
          onChangeValue?.('');
        } else {
          onChangeValue?.(text);
        }
      },
      [onChangeValue],
    );

    const handleBlur = useCallback(
      (e: any) => {
        if (localValue !== '') {
          const parsed = parseFloat(localValue);
          if (!isNaN(parsed)) {
            const formatted = formatNumber(parsed);
            setLocalValue(formatted);
            onChangeValue?.(formatted);
          }
        }
        onBlur?.(e);
      },
      [localValue, formatNumber, onChangeValue, onBlur],
    );

    return (
      <Input
        ref={ref}
        disabled={disabled}
        readOnly={readOnly}
        value={localValue}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        keyboardType="decimal-pad"
        inputStyle={[{ textAlign: 'center' }, inputStyle]}
        leftIcon={({ color, size }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease value"
            accessibilityState={{ disabled: disabled || isMinReached }}
            disabled={disabled || readOnly || isMinReached}
            onPress={handleDecrement}
            hitSlop={12}
            style={{
              opacity: disabled || isMinReached ? 0.3 : 1,
              padding: 4,
              // backgroundColor: 'lightblue',
            }}
          >
            <Ionicons name="remove-sharp" color={color} size={size} />
          </Pressable>
        )}
        rightIcon={({ color, size }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase value"
            accessibilityState={{ disabled: disabled || isMaxReached }}
            disabled={disabled || readOnly || isMaxReached}
            onPress={handleIncrement}
            hitSlop={12}
            style={{
              opacity: disabled || isMaxReached ? 0.3 : 1,
              padding: 4,
              // backgroundColor: 'lightblue',
            }}
          >
            <Ionicons name="add-outline" color={color} size={size} />
          </Pressable>
        )}
        {...props}
      />
    );
  }),
);

import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

import { Input } from '@/components/form/Input';

import type { SearchInputProps } from './types';

/**
 * Search-specialized input. It remains controlled through `value` and
 * `onChangeText`; `onDebouncedChange` is optional for delayed query consumers.
 */
export const SearchInput = memo(function SearchInput({
  loading = false,
  onDebouncedChange,
  debounceDelay,
  value,
  ...inputProps
}: SearchInputProps) {
  const query = value ?? '';

  useEffect(() => {
    if (onDebouncedChange == null || debounceDelay == null) return;

    const timeout = setTimeout(() => onDebouncedChange(query), debounceDelay);
    return () => clearTimeout(timeout);
  }, [debounceDelay, onDebouncedChange, query]);

  return (
    <Input
      {...inputProps}
      value={value}
      clearable
      leftIcon={({ color, size }) => <Ionicons name="search" color={color} size={size} />}
      rightIcon={
        loading ? ({ color, size }) => <ActivityIndicator color={color} size={size} /> : undefined
      }
    />
  );
});

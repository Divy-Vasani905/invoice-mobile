import type { InputProps } from '@/components/form/Input';

export interface SearchInputProps extends Omit<
  InputProps,
  'leftIcon' | 'rightIcon' | 'secureTextEntry'
> {
  loading?: boolean;
  onDebouncedChange?: (query: string) => void;
  debounceDelay?: number;
}

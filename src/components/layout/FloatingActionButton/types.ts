import type { ReactNode } from 'react';

export interface FloatingActionButtonProps {
  icon: (props: { color: string; size: number }) => ReactNode;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
}

import type { ReactNode } from 'react';

export interface SegmentOption {
  value: string;
  label: string;
  disabled?: boolean;
  badgeCount?: number;
  icon?: (props: { color: string; size: number }) => ReactNode;
}
export interface SegmentControlProps {
  options: readonly SegmentOption[];
  value: string;
  onValueChange?: (value: string) => void;
  scrollable?: boolean;
  equalWidth?: boolean;
}

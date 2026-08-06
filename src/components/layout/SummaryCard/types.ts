import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { CardVariant } from '@/theme';

export interface SummaryCardProps {
  /** The title of the summary metric (e.g., "Total Revenue") */
  title: string;
  /** The primary formatted value (e.g., "$12,450.00") */
  value: string;
  /** Optional secondary subtitle text */
  subtitle?: string;
  /** Optional badge component to display in the header or trailing section (e.g. growth rate) */
  badge?: ReactNode;
  /** Visual variant of the card container */
  variant?: CardVariant;
  /** Optional click handler to make card pressable */
  onPress?: () => void;
  /** Custom styles for the card container */
  style?: StyleProp<ViewStyle>;
  /** Loading state flag */
  loading?: boolean;
}

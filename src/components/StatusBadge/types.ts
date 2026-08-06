import type { BadgeProps } from '@/components/Badge';

export type StatusBadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusBadgeStatus;
}

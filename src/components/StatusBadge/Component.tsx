import { memo } from 'react';

import { Badge } from '@/components/Badge';

import type { StatusBadgeProps } from './types';

/**
 * Semantic status indicator constrained to neutral, info, success, warning,
 * and danger states.
 */
export const StatusBadge = memo(function StatusBadge({ status, ...badgeProps }: StatusBadgeProps) {
  return <Badge {...badgeProps} variant={status} />;
});

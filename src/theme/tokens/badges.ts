import type { SemanticColorToken } from '@/theme/colors/semantic';
import { radius, spacing } from '@/theme/cStyle';
import type { TypographyToken } from '@/theme/tokens/typography';

/**
 * Badge styling tokens for status chips and counts.
 */

export type BadgeSize = 'sm' | 'md';
export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'premium'
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'draft'
  | 'cancelled';

export type BadgeColorRoles = {
  background: SemanticColorToken;
  text: SemanticColorToken;
  border: SemanticColorToken | 'transparent';
};

export const badgeSizes = {
  sm: {
    minHeight: spacing['2xl'],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    gap: spacing.xxs,
    radius: radius.full,
    typography: 'caption' as TypographyToken,
  },
  md: {
    minHeight: spacing['3xl'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    radius: radius.full,
    typography: 'label' as TypographyToken,
  },
} as const;

export const badgeVariants: Record<BadgeVariant, BadgeColorRoles> = {
  neutral: {
    background: 'backgroundSubtle',
    text: 'textSecondary',
    border: 'transparent',
  },
  primary: {
    background: 'primarySubtle',
    text: 'primary',
    border: 'transparent',
  },
  success: {
    background: 'successSubtle',
    text: 'success',
    border: 'transparent',
  },
  warning: {
    background: 'warningSubtle',
    text: 'warning',
    border: 'transparent',
  },
  danger: {
    background: 'dangerSubtle',
    text: 'danger',
    border: 'transparent',
  },
  info: {
    background: 'infoSubtle',
    text: 'info',
    border: 'transparent',
  },
  premium: {
    background: 'premiumSubtle',
    text: 'premium',
    border: 'transparent',
  },
  paid: {
    background: 'statusPaidSubtle',
    text: 'statusPaid',
    border: 'transparent',
  },
  pending: {
    background: 'statusPendingSubtle',
    text: 'statusPending',
    border: 'transparent',
  },
  overdue: {
    background: 'statusOverdueSubtle',
    text: 'statusOverdue',
    border: 'transparent',
  },
  draft: {
    background: 'statusDraftSubtle',
    text: 'statusDraft',
    border: 'transparent',
  },
  cancelled: {
    background: 'statusCancelledSubtle',
    text: 'statusCancelled',
    border: 'transparent',
  },
};

export const badgeTokens = {
  sizes: badgeSizes,
  variants: badgeVariants,
} as const;

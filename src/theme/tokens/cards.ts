import type { SemanticColorToken } from '@/theme/colors/semantic';
import { radius, spacing } from '@/theme/cStyle';
import type { ElevationToken } from '@/theme/tokens/elevation';

/**
 * Card surface tokens — padding, radius, elevation, and color roles.
 */

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';

export type CardColorValue = SemanticColorToken | 'transparent';

export type CardVariantToken = {
  background: CardColorValue;
  border: CardColorValue;
  elevation: ElevationToken;
};

export const cardLayout = {
  padding: spacing.lg,
  paddingCompact: spacing.md,
  gap: spacing.md,
  radius: radius.lg,
  borderWidth: 1,
} as const;

export const cardVariants: Record<CardVariant, CardVariantToken> = {
  elevated: {
    background: 'card',
    border: 'transparent',
    elevation: 'sm',
  },
  outlined: {
    background: 'card',
    border: 'border',
    elevation: 'none',
  },
  filled: {
    background: 'backgroundSubtle',
    border: 'transparent',
    elevation: 'none',
  },
  ghost: {
    background: 'transparent',
    border: 'transparent',
    elevation: 'none',
  },
};

export const cardTokens = {
  layout: cardLayout,
  variants: cardVariants,
} as const;

import type { SemanticColorToken } from '@/theme/colors/semantic';
import { radius, spacing } from '@/theme/cStyle';
import { iconSizes, type IconSizeToken } from '@/theme/tokens/iconSizes';
import type { TypographyToken } from '@/theme/tokens/typography';

/**
 * Button structural + semantic role tokens.
 * No components — resolve color roles against the active theme at render time.
 */

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'disabled';

export type ButtonColorValue = SemanticColorToken | 'transparent';

export type ButtonColorRoles = {
  background: ButtonColorValue;
  backgroundPressed: ButtonColorValue;
  border: ButtonColorValue;
  text: ButtonColorValue;
};

export type ButtonSizeToken = {
  minHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
  gap: number;
  radius: number;
  typography: TypographyToken;
  iconSize: IconSizeToken;
};

export const buttonSizes: Record<ButtonSize, ButtonSizeToken> = {
  sm: {
    minHeight: spacing['3xl'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    radius: radius.sm,
    typography: 'label',
    iconSize: 'sm',
  },
  md: {
    minHeight: spacing['4xl'] + spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    radius: radius.md,
    typography: 'button',
    iconSize: 'md',
  },
  lg: {
    minHeight: spacing['5xl'] + spacing.xs,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    gap: spacing.sm,
    radius: radius.lg,
    typography: 'button',
    iconSize: 'lg',
  },
};

export const buttonVariants: Record<ButtonVariant, ButtonColorRoles> = {
  primary: {
    background: 'primary',
    backgroundPressed: 'interactivePressed',
    border: 'primary',
    text: 'onPrimary',
  },
  secondary: {
    background: 'secondarySubtle',
    backgroundPressed: 'backgroundSubtle',
    border: 'secondarySubtle',
    text: 'secondary',
  },
  outline: {
    background: 'transparent',
    backgroundPressed: 'backgroundSubtle',
    border: 'borderStrong',
    text: 'textPrimary',
  },
  ghost: {
    background: 'transparent',
    backgroundPressed: 'backgroundSubtle',
    border: 'transparent',
    text: 'primary',
  },
  danger: {
    background: 'danger',
    backgroundPressed: 'dangerMuted',
    border: 'danger',
    text: 'onDanger',
  },
  disabled: {
    background: 'interactiveDisabled',
    backgroundPressed: 'interactiveDisabled',
    border: 'interactiveDisabled',
    text: 'textDisabled',
  },
};

export const buttonTokens = {
  sizes: buttonSizes,
  variants: buttonVariants,
  /** Convenience — default control icon size when size is unspecified. */
  defaultIconSize: iconSizes.md,
} as const;

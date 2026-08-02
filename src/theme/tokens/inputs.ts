import type { SemanticColorToken } from '@/theme/colors/semantic';
import { radius, spacing } from '@/theme/cStyle';
import type { TypographyToken } from '@/theme/tokens/typography';

/**
 * Input field styling tokens — structure + color roles only.
 */

export type InputState = 'default' | 'focused' | 'error' | 'disabled';

export type InputColorRoles = {
  background: SemanticColorToken;
  border: SemanticColorToken;
  text: SemanticColorToken;
  placeholder: SemanticColorToken;
  label: SemanticColorToken;
  helper: SemanticColorToken;
  icon: SemanticColorToken;
};

export const inputLayout = {
  minHeight: spacing['5xl'],
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  gap: spacing.xs,
  radius: radius.md,
  borderWidth: 1,
  focusedBorderWidth: 1.5,
  typography: 'input' as TypographyToken,
  labelTypography: 'label' as TypographyToken,
  helperTypography: 'helper' as TypographyToken,
  errorTypography: 'error' as TypographyToken,
} as const;

export const inputStates: Record<InputState, InputColorRoles> = {
  default: {
    background: 'surface',
    border: 'border',
    text: 'textPrimary',
    placeholder: 'textPlaceholder',
    label: 'textSecondary',
    helper: 'textTertiary',
    icon: 'textTertiary',
  },
  focused: {
    background: 'surface',
    border: 'borderFocus',
    text: 'textPrimary',
    placeholder: 'textPlaceholder',
    label: 'primary',
    helper: 'textSecondary',
    icon: 'primary',
  },
  error: {
    background: 'surface',
    border: 'danger',
    text: 'textPrimary',
    placeholder: 'textPlaceholder',
    label: 'danger',
    helper: 'danger',
    icon: 'danger',
  },
  disabled: {
    background: 'backgroundSubtle',
    border: 'border',
    text: 'textDisabled',
    placeholder: 'textDisabled',
    label: 'textDisabled',
    helper: 'textDisabled',
    icon: 'textDisabled',
  },
};

export const inputTokens = {
  layout: inputLayout,
  states: inputStates,
} as const;

import type { SemanticColors } from '@/theme/colors/semantic';
import {
  animationDuration,
  animationEasing,
  avatarSizes,
  badgeTokens,
  buttonTokens,
  cardTokens,
  elevation,
  fonts,
  iconSizes,
  inputTokens,
  typography,
} from '@/theme/tokens';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

/**
 * Theme data for colors / typography / component tokens.
 * For padding, margin, flex, radius, opacity, zIndex — use `cStyle` only.
 */
export type AppTheme = {
  mode: ThemeMode;
  colors: SemanticColors;
  elevation: typeof elevation;
  typography: typeof typography;
  fonts: typeof fonts;
  iconSizes: typeof iconSizes;
  avatarSizes: typeof avatarSizes;
  animation: {
    duration: typeof animationDuration;
    easing: typeof animationEasing;
  };
  buttons: typeof buttonTokens;
  inputs: typeof inputTokens;
  cards: typeof cardTokens;
  badges: typeof badgeTokens;
};

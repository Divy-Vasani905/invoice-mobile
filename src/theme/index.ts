export { palette, lightColors, darkColors } from '@/theme/colors';
export type { Palette, SemanticColors, SemanticColorToken } from '@/theme/colors';

/**
 * Layout CSS utilities — single source of truth.
 * Prefer `cStyle.p16`, `cStyle.flexRow`, `cStyle.r12`, etc. in every screen/component.
 */
export { cStyle } from '@/theme/cStyle';
export type { AtomicStyles } from '@/theme/cStyle';

export {
  elevation,
  typography,
  fonts,
  fontFamilies,
  activeFontFamily,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacings,
  iconSizes,
  avatarSizes,
  animationDuration,
  animationEasing,
  buttonTokens,
  inputTokens,
  cardTokens,
  badgeTokens,
} from '@/theme/tokens';

export type {
  ElevationToken,
  ElevationStyle,
  TypographyToken,
  TypographyStyle,
  FontFamilyPack,
  FontFamilyMap,
  IconSizeToken,
  AvatarSizeToken,
  AnimationDurationToken,
  ButtonVariant,
  ButtonSize,
  InputState,
  CardVariant,
  BadgeVariant,
  BadgeSize,
} from '@/theme/tokens';

export { lightTheme, darkTheme, themes, getTheme } from '@/theme/themes';
export type { AppTheme, ThemeMode, ThemePreference } from '@/theme/types';

export { ThemeProvider } from '@/theme/provider/ThemeProvider';
export type { ThemeProviderProps } from '@/theme/provider/ThemeProvider';
export type { ThemeContextValue } from '@/theme/provider/ThemeContext';

export { useTheme } from '@/theme/hooks/useTheme';

export {
  getStoredThemePreference,
  setStoredThemePreference,
  clearStoredThemePreference,
} from '@/theme/persistence/theme-preference';

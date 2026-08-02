/**
 * Semantic color token contract shared by light and dark themes.
 * Named by purpose, never by hue.
 */
export type SemanticColors = {
  // Brand / feedback
  primary: string;
  primaryMuted: string;
  primarySubtle: string;
  onPrimary: string;

  secondary: string;
  secondaryMuted: string;
  secondarySubtle: string;
  onSecondary: string;

  success: string;
  successMuted: string;
  successSubtle: string;
  onSuccess: string;

  warning: string;
  warningMuted: string;
  warningSubtle: string;
  onWarning: string;

  danger: string;
  dangerMuted: string;
  dangerSubtle: string;
  onDanger: string;

  info: string;
  infoMuted: string;
  infoSubtle: string;
  onInfo: string;

  // Surfaces
  background: string;
  backgroundSubtle: string;
  surface: string;
  surfaceRaised: string;
  card: string;
  modal: string;
  overlay: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  textLink: string;
  textPlaceholder: string;

  // Borders & chrome
  border: string;
  borderStrong: string;
  borderFocus: string;
  divider: string;
  placeholder: string;
  shadow: string;
  focusRing: string;
  scrim: string;

  // Interactive / state
  interactive: string;
  interactiveHover: string;
  interactivePressed: string;
  interactiveDisabled: string;

  // Invoice status
  statusPaid: string;
  statusPaidSubtle: string;
  statusPending: string;
  statusPendingSubtle: string;
  statusOverdue: string;
  statusOverdueSubtle: string;
  statusDraft: string;
  statusDraftSubtle: string;
  statusCancelled: string;
  statusCancelledSubtle: string;

  // Charts
  chartRevenue: string;
  chartExpense: string;
  chartProfit: string;
  chartLoss: string;
  chartGrid: string;
  chartAxis: string;

  // Ads (future monetization surfaces)
  adBackground: string;
  adBorder: string;
  adLabel: string;
  adAccent: string;

  // Premium / subscription
  premium: string;
  premiumMuted: string;
  premiumSubtle: string;
  onPremium: string;
  premiumGradientStart: string;
  premiumGradientEnd: string;
};

export type SemanticColorToken = keyof SemanticColors;

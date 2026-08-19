import { palette } from '@/theme/colors/primitives';
import type { SemanticColors } from '@/theme/colors/semantic';

/**
 * Light theme semantic colors.
 * Surfaces sit on cool neutrals; brand blue matches the product splash accent.
 */
export const lightColors: SemanticColors = {
  primary: palette.blue[500],
  primaryMuted: palette.blue[400],
  primarySubtle: palette.blue[50],
  primaryLogoBackground: palette.blue[50],
  onPrimary: palette.white,

  secondary: palette.navy[600],
  secondaryMuted: palette.navy[400],
  secondarySubtle: palette.navy[50],
  onSecondary: palette.white,

  success: palette.green[600],
  successMuted: palette.green[500],
  successSubtle: palette.green[50],
  onSuccess: palette.white,

  warning: palette.amber[600],
  warningMuted: palette.amber[500],
  warningSubtle: palette.amber[50],
  onWarning: palette.navy[900],

  danger: palette.red[600],
  dangerMuted: palette.red[500],
  dangerSubtle: palette.red[50],
  onDanger: palette.white,

  info: palette.teal[600],
  infoMuted: palette.teal[500],
  infoSubtle: palette.teal[50],
  onInfo: palette.white,

  background: palette.gray[50],
  backgroundSubtle: palette.gray[100],
  surface: palette.white,
  surfaceRaised: palette.white,
  card: palette.white,
  modal: palette.white,
  overlay: 'rgba(15, 17, 21, 0.48)',

  textPrimary: palette.navy[900],
  textSecondary: palette.navy[500],
  textTertiary: palette.navy[400],
  textDisabled: palette.navy[300],
  textInverse: palette.white,
  textLink: palette.blue[600],
  textPlaceholder: palette.navy[300],

  border: palette.gray[200],
  borderStrong: palette.gray[300],
  borderFocus: palette.blue[500],
  divider: palette.gray[100],
  placeholder: palette.gray[300],
  shadow: palette.navy[900],
  focusRing: palette.blue[200],
  scrim: 'rgba(15, 17, 21, 0.4)',

  interactive: palette.blue[500],
  interactiveHover: palette.blue[600],
  interactivePressed: palette.blue[700],
  interactiveDisabled: palette.gray[200],

  statusPaid: palette.green[600],
  statusPaidSubtle: palette.green[50],
  statusPending: palette.amber[600],
  statusPendingSubtle: palette.amber[50],
  statusOverdue: palette.red[600],
  statusOverdueSubtle: palette.red[50],
  statusDraft: palette.navy[400],
  statusDraftSubtle: palette.navy[50],
  statusCancelled: palette.gray[500],
  statusCancelledSubtle: palette.gray[100],

  chartRevenue: palette.blue[500],
  chartExpense: palette.orange[500],
  chartProfit: palette.green[500],
  chartLoss: palette.red[500],
  chartGrid: palette.gray[100],
  chartAxis: palette.navy[300],

  adBackground: palette.gray[50],
  adBorder: palette.gray[200],
  adLabel: palette.navy[400],
  adAccent: palette.blue[400],

  premium: palette.violet[600],
  premiumMuted: palette.violet[500],
  premiumSubtle: palette.violet[50],
  onPremium: palette.white,
  premiumGradientStart: palette.violet[600],
  premiumGradientEnd: palette.blue[500],
};

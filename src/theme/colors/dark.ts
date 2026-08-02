import { palette } from '@/theme/colors/primitives';
import type { SemanticColors } from '@/theme/colors/semantic';

/**
 * Dark theme semantic colors.
 * Designed as a proper dark palette (elevated navy surfaces), not an inverted light theme.
 */
export const darkColors: SemanticColors = {
  primary: palette.blue[400],
  primaryMuted: palette.blue[300],
  primarySubtle: 'rgba(75, 163, 244, 0.16)',
  onPrimary: palette.navy[950],

  secondary: palette.navy[200],
  secondaryMuted: palette.navy[300],
  secondarySubtle: 'rgba(154, 168, 187, 0.12)',
  onSecondary: palette.navy[950],

  success: palette.green[400],
  successMuted: palette.green[500],
  successSubtle: 'rgba(74, 222, 128, 0.14)',
  onSuccess: palette.navy[950],

  warning: palette.amber[400],
  warningMuted: palette.amber[500],
  warningSubtle: 'rgba(251, 191, 36, 0.14)',
  onWarning: palette.navy[950],

  danger: palette.red[400],
  dangerMuted: palette.red[500],
  dangerSubtle: 'rgba(248, 113, 113, 0.14)',
  onDanger: palette.navy[950],

  info: palette.teal[400],
  infoMuted: palette.teal[500],
  infoSubtle: 'rgba(45, 212, 191, 0.14)',
  onInfo: palette.navy[950],

  background: palette.navy[950],
  backgroundSubtle: palette.navy[900],
  surface: palette.navy[900],
  surfaceRaised: palette.navy[800],
  card: palette.navy[800],
  modal: palette.navy[800],
  overlay: 'rgba(7, 11, 20, 0.72)',

  textPrimary: palette.gray[50],
  textSecondary: palette.navy[200],
  textTertiary: palette.navy[300],
  textDisabled: palette.navy[400],
  textInverse: palette.navy[950],
  textLink: palette.blue[300],
  textPlaceholder: palette.navy[400],

  border: palette.navy[700],
  borderStrong: palette.navy[600],
  borderFocus: palette.blue[400],
  divider: palette.navy[700],
  placeholder: palette.navy[600],
  shadow: palette.black,
  focusRing: 'rgba(75, 163, 244, 0.4)',
  scrim: 'rgba(7, 11, 20, 0.64)',

  interactive: palette.blue[400],
  interactiveHover: palette.blue[300],
  interactivePressed: palette.blue[500],
  interactiveDisabled: palette.navy[700],

  statusPaid: palette.green[400],
  statusPaidSubtle: 'rgba(74, 222, 128, 0.14)',
  statusPending: palette.amber[400],
  statusPendingSubtle: 'rgba(251, 191, 36, 0.14)',
  statusOverdue: palette.red[400],
  statusOverdueSubtle: 'rgba(248, 113, 113, 0.14)',
  statusDraft: palette.navy[300],
  statusDraftSubtle: 'rgba(107, 124, 150, 0.16)',
  statusCancelled: palette.navy[400],
  statusCancelledSubtle: 'rgba(74, 93, 122, 0.2)',

  chartRevenue: palette.blue[400],
  chartExpense: palette.orange[400],
  chartProfit: palette.green[400],
  chartLoss: palette.red[400],
  chartGrid: palette.navy[700],
  chartAxis: palette.navy[400],

  adBackground: palette.navy[900],
  adBorder: palette.navy[700],
  adLabel: palette.navy[300],
  adAccent: palette.blue[300],

  premium: palette.violet[400],
  premiumMuted: palette.violet[500],
  premiumSubtle: 'rgba(167, 139, 250, 0.16)',
  onPremium: palette.navy[950],
  premiumGradientStart: palette.violet[500],
  premiumGradientEnd: palette.blue[400],
};

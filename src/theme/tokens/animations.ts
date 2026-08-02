/**
 * Motion timing tokens only — no animation implementations.
 * Durations are in milliseconds.
 */
export const animationDuration = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  deliberate: 600,
} as const;

export const animationEasing = {
  standard: 'ease-in-out',
  entrance: 'ease-out',
  exit: 'ease-in',
  linear: 'linear',
} as const;

export type AnimationDurationToken = keyof typeof animationDuration;
export type AnimationEasingToken = keyof typeof animationEasing;

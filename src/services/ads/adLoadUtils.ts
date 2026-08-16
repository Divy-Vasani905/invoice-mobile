import { CrashlyticsService } from '@/services/crashlytics';

/** How long Watch Ad waits for a production fill before giving up. */
export const REWARDED_SHOW_WAIT_MS = 20_000;

/** How long an interstitial may wait after invoice create before skipping. */
export const INTERSTITIAL_SHOW_WAIT_MS = 8_000;

/** Backoff when a background preload fails (NO_FILL is common on new apps). */
export const AD_BACKGROUND_RETRY_DELAYS_MS = [8_000, 20_000, 45_000, 60_000] as const;

/** Faster retry while the user is waiting on Watch Ad. */
export const AD_USER_WAIT_RETRY_MS = 2_000;

export type AdLoadWaiter = (ready: boolean) => void;

export function extractAdError(error: unknown): { code: string; message: string } {
  if (error instanceof Error) {
    const withCode = error as Error & { code?: unknown };
    return {
      code: typeof withCode.code === 'string' ? withCode.code : 'unknown',
      message: error.message,
    };
  }

  if (error != null && typeof error === 'object') {
    const record = error as { code?: unknown; message?: unknown };
    return {
      code: typeof record.code === 'string' ? record.code : 'unknown',
      message: typeof record.message === 'string' ? record.message : 'Ad request failed',
    };
  }

  return { code: 'unknown', message: 'Ad request failed' };
}

export function logAdEvent(message: string): void {
  if (__DEV__) {
    console.warn(message);
  }
  CrashlyticsService.log(message);
}

export function nextRetryDelayMs(attempt: number, userIsWaiting: boolean): number {
  if (userIsWaiting) return AD_USER_WAIT_RETRY_MS;
  const lastIndex = AD_BACKGROUND_RETRY_DELAYS_MS.length - 1;
  const index = Math.min(Math.max(0, attempt), lastIndex);
  return AD_BACKGROUND_RETRY_DELAYS_MS[index] ?? 60_000;
}

export function notifyAdLoadWaiters(waiters: AdLoadWaiter[], ready: boolean): void {
  for (const waiter of waiters) {
    try {
      waiter(ready);
    } catch {
      // Waiters must not break ad loading.
    }
  }
}

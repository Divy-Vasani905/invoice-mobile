import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  checkForAppUpdate,
  dismissOptionalUpdatePrompt,
  openStoreListing,
  shouldSuppressOptionalUpdatePrompt,
  type AppUpdateCheckResult,
} from '@/features/app-update/services/AppUpdateService';
import { useRemoteConfigStore } from '@/stores/remote-config/remote-config-store';

export function useAppUpdatePrompt() {
  const forceUpdate = useRemoteConfigStore((s) => s.globalConfig.forceUpdate);
  const allowAppUsage = useRemoteConfigStore((s) => s.globalConfig.allowAppUsage);
  const isInitialized = useRemoteConfigStore((s) => s.isInitialized);

  const [check, setCheck] = useState<AppUpdateCheckResult | null>(null);
  const [dismissedSession, setDismissedSession] = useState(false);

  useEffect(() => {
    if (!isInitialized || !allowAppUsage) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await checkForAppUpdate();
      if (cancelled) return;
      setCheck(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [allowAppUsage, isInitialized]);

  const isForced = forceUpdate || check?.forceUpdate === true;

  const visible = useMemo(() => {
    if (!isInitialized || !allowAppUsage || dismissedSession) return false;
    if (check == null || !check.isUpdateAvailable) return false;
    if (isForced) return true;
    if (shouldSuppressOptionalUpdatePrompt()) return false;
    return true;
  }, [allowAppUsage, check, dismissedSession, isForced, isInitialized]);

  const onLater = useCallback(() => {
    if (isForced) return;
    dismissOptionalUpdatePrompt();
    setDismissedSession(true);
  }, [isForced]);

  const onUpdate = useCallback(async () => {
    await openStoreListing(check?.storeUrl ?? null);
  }, [check?.storeUrl]);

  const onRequestClose = useCallback(() => {
    if (isForced) return;
    onLater();
  }, [isForced, onLater]);

  return {
    visible,
    isForced,
    currentVersion: check?.currentVersion,
    latestVersion: check?.latestVersion,
    onLater,
    onUpdate,
    onRequestClose,
  };
}

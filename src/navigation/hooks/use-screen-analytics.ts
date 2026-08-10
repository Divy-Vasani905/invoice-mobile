import { usePathname, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { AnalyticsEvents, AnalyticsService } from '@/services/analytics';

/**
 * Maps Expo Router paths to stable Analytics screen names.
 * Returns null for routes that should not emit a screen view.
 */
export function resolveAnalyticsScreenName(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/index')) {
    return 'Dashboard';
  }
  if (pathname.startsWith('/dashboard/products')) {
    return 'Products';
  }
  if (pathname === '/invoices' || pathname === '/invoices/') {
    return 'Invoices';
  }
  if (pathname === '/customers' || pathname === '/customers/') {
    return 'Customers';
  }
  if (pathname === '/settings' || pathname === '/settings/') {
    return 'Settings';
  }
  if (pathname.startsWith('/settings/business-profile')) {
    return 'Business Profile';
  }
  if (pathname.startsWith('/settings/business-form')) {
    return 'Business Profile';
  }
  if (pathname.startsWith('/create-invoice')) {
    return 'Create Invoice';
  }
  if (pathname.startsWith('/edit-invoice/')) {
    return 'Edit Invoice';
  }
  if (pathname.startsWith('/invoice-preview/') || pathname.startsWith('/invoice-pdf/')) {
    return 'Invoice Preview';
  }
  return null;
}

/**
 * Tracks meaningful screen views via Expo Router pathname changes.
 */
export function useScreenAnalytics(): void {
  const pathname = usePathname();
  const segments = useSegments();
  const lastScreenRef = useRef<string | null>(null);

  useEffect(() => {
    const screenName = resolveAnalyticsScreenName(pathname);
    if (screenName == null) return;
    if (lastScreenRef.current === screenName) return;
    lastScreenRef.current = screenName;

    void AnalyticsService.logScreenView(screenName, segments.join('/') || screenName);

    if (screenName === 'Dashboard') {
      void AnalyticsService.logEvent(AnalyticsEvents.DashboardViewed);
    }
  }, [pathname, segments]);
}

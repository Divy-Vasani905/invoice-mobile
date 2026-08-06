import type { ToastShowParams } from 'react-native-toast-message';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  position?: ToastShowParams['position'];
  actionLabel?: string;
  onAction?: () => void;
}

import type { BottomSheetProps } from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';

export interface FeedbackBottomSheetProps extends Omit<
  BottomSheetProps,
  'backgroundStyle' | 'children' | 'footerComponent' | 'handleIndicatorStyle'
> {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  closable?: boolean;
  scrollable?: boolean;
}

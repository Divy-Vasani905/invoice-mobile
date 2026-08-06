import type { ButtonSize } from '@/theme';

import type { ReactNode } from 'react';

export type FormIconRenderer = (props: { color: string; size: number }) => ReactNode;

export type FormControlSize = ButtonSize;

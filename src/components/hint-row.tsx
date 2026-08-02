import { View } from 'react-native';

import { cStyle } from '@/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import type { ReactNode } from 'react';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View style={[cStyle.flexRow, cStyle.justifyBetween]}>
      <ThemedText type="small">{title}</ThemedText>
      <ThemedView type="backgroundSelected" style={[cStyle.r8, cStyle.pv2, cStyle.ph8]}>
        <ThemedText themeColor="textSecondary">{hint}</ThemedText>
      </ThemedView>
    </View>
  );
}

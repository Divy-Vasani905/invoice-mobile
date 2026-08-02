import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { cStyle } from '@/theme';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  return (
    <ThemedView style={[cStyle.flex1, cStyle.justifyCenter, cStyle.flexRow]}>
      <SafeAreaView style={[safeAreaStyle, cStyle.flex1, cStyle.ph24, cStyle.itemCenter, cStyle.g16]}>
        <ThemedView
          style={[cStyle.itemCenter, cStyle.justifyCenter, cStyle.flex1, cStyle.ph24, cStyle.g24]}
        >
          <AnimatedIcon />
          <ThemedText type="title" style={cStyle.textCenter}>
            Welcome to&nbsp;Expo
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={codeStyle}>
          get started
        </ThemedText>

        <ThemedView
          type="backgroundElement"
          style={[cStyle.g16, cStyle.selfStretch, cStyle.ph16, cStyle.pv24, cStyle.r24]}
        >
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const safeAreaStyle = {
  paddingBottom: BottomTabInset + 16,
  maxWidth: MaxContentWidth,
} as const;

const codeStyle = { textTransform: 'uppercase' } as const;

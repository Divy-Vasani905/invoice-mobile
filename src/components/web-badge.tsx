import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';

import { cStyle } from '@/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <ThemedView style={[cStyle.p32, cStyle.itemCenter, cStyle.g8]}>
      <ThemedText type="code" themeColor="textSecondary" style={cStyle.textCenter}>
        v{version}
      </ThemedText>
      <Image
        source={
          scheme === 'dark'
            ? require('@/assets/images/expo-badge-white.png')
            : require('@/assets/images/expo-badge.png')
        }
        style={badgeImageStyle}
      />
    </ThemedView>
  );
}

const badgeImageStyle = { width: 123, aspectRatio: 123 / 24 } as const;

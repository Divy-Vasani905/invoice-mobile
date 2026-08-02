import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View } from 'react-native';

import { Colors, MaxContentWidth } from '@/constants/theme';
import { cStyle } from '@/theme';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Explore</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && cStyle.opacity70}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={[cStyle.pv4, cStyle.ph16, cStyle.r16]}
      >
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={[tabListContainerStyle, cStyle.p16, cStyle.justifyCenter, cStyle.itemCenter, cStyle.flexRow]}>
      <ThemedView
        type="backgroundElement"
        style={[innerContainerStyle, cStyle.pv8, cStyle.ph32, cStyle.r32, cStyle.flexRow, cStyle.itemCenter, cStyle.flexGrow, cStyle.g8]}
      >
        <ThemedText type="smallBold" style={brandTextStyle}>
          Expo Starter
        </ThemedText>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={[cStyle.flexRow, cStyle.justifyCenter, cStyle.itemCenter, cStyle.g4, cStyle.ml16]}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const tabListContainerStyle = { position: 'absolute', width: '100%' } as const;
const innerContainerStyle = { maxWidth: MaxContentWidth } as const;
const brandTextStyle = { marginRight: 'auto' } as const;

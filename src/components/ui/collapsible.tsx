import { SymbolView } from 'expo-symbols';
import { PropsWithChildren, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { cStyle } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <ThemedView>
      <Pressable
        style={({ pressed }) => [cStyle.flexRow, cStyle.itemCenter, cStyle.g8, pressed && cStyle.opacity70]}
        onPress={() => setIsOpen((value) => !value)}
      >
        <ThemedView
          type="backgroundElement"
          style={[buttonStyle, cStyle.r12, cStyle.justifyCenter, cStyle.itemCenter]}
        >
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={14}
            weight="bold"
            tintColor={theme.text}
            style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }}
          />
        </ThemedView>

        <ThemedText type="small">{title}</ThemedText>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <ThemedView
            type="backgroundElement"
            style={[cStyle.mt16, cStyle.r16, cStyle.ml24, cStyle.p24]}
          >
            {children}
          </ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const buttonStyle = { width: 24, height: 24 } as const;

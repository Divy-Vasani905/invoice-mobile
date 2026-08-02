import { Platform, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cStyle } from '@/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && textStyles.default,
        type === 'title' && textStyles.title,
        type === 'small' && textStyles.small,
        type === 'smallBold' && textStyles.smallBold,
        type === 'subtitle' && textStyles.subtitle,
        type === 'link' && textStyles.link,
        type === 'linkPrimary' && textStyles.linkPrimary,
        type === 'code' && textStyles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const textStyles = {
  small: [cStyle.f14, cStyle.fontMedium, { lineHeight: 20 }],
  smallBold: [cStyle.f14, cStyle.fontBold, { lineHeight: 20 }],
  default: [cStyle.f16, cStyle.fontMedium, { lineHeight: 24 }],
  title: [cStyle.f48, cStyle.fontSemiBold, { lineHeight: 52 }],
  subtitle: [cStyle.f32, cStyle.fontSemiBold, { lineHeight: 44 }],
  link: [cStyle.f14, { lineHeight: 30 }],
  linkPrimary: [cStyle.f14, { lineHeight: 30, color: '#3c87f7' }],
  code: [
    cStyle.f12,
    {
      fontFamily: Fonts.mono,
      fontWeight: Platform.select({ android: 700 as const }) ?? (500 as const),
    },
  ],
} as const;

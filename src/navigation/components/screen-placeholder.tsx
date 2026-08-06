import { Text, View } from 'react-native';

import { cStyle, useTheme } from '@/theme';

export type ScreenPlaceholderProps = {
  name: string;
};

/**
 * Temporary body for a route that exists in the navigation tree but has no UI
 * yet. Delete each usage as the matching feature screen is built.
 */
export function ScreenPlaceholder({ name }: ScreenPlaceholderProps) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[
        cStyle.flex1,
        cStyle.itemCenter,
        cStyle.justifyCenter,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={[typography.title, { color: colors.textPrimary }]}>{name}</Text>
    </View>
  );
}

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

export interface BusinessImageFieldProps {
  label: string;
  uri?: string;
  placeholderLabel: string;
  changeLabel: string;
  removeLabel: string;
  aspectRatio?: number;
  onChangePress: () => void;
  onRemovePress: () => void;
}

export function BusinessImageField({
  label,
  uri,
  placeholderLabel,
  changeLabel,
  removeLabel,
  aspectRatio = 1,
  onChangePress,
  onRemovePress,
}: BusinessImageFieldProps) {
  const { theme } = useTheme();
  const hasImage = uri != null && uri.length > 0;

  return (
    <View style={[cStyle.g12]}>
      <ThemedText style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
        {label}
      </ThemedText>
      <View
        accessible
        accessibilityLabel={hasImage ? `${label} preview` : `${label} placeholder`}
        style={[
          cStyle.itemCenter,
          cStyle.justifyCenter,
          cStyle.r16,
          {
            aspectRatio,
            width: '100%',
            maxWidth: cStyleValues.spacing['7xl'] * 3,
            alignSelf: 'center',
            overflow: 'hidden',
            backgroundColor: theme.colors.backgroundSubtle,
            borderWidth: theme.cards.layout.borderWidth,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {hasImage ? (
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            accessibilityLabel={`${label} image`}
          />
        ) : (
          <View style={[cStyle.itemCenter, cStyle.g8, cStyle.ph16]}>
            <Ionicons
              name="image-outline"
              size={theme.iconSizes.xl}
              color={theme.colors.textTertiary}
            />
            <ThemedText
              style={[
                theme.typography.helper,
                cStyle.textCenter,
                { color: theme.colors.textSecondary },
              ]}
            >
              {placeholderLabel}
            </ThemedText>
          </View>
        )}
      </View>
      <View style={[cStyle.flexRow, cStyle.g12]}>
        <Button
          label={changeLabel}
          variant="outline"
          style={cStyle.flex1}
          onPress={onChangePress}
          accessibilityHint={`Opens the gallery to choose a ${label.toLowerCase()}`}
        />
        {hasImage && (
          <Button
            label={removeLabel}
            variant="ghost"
            style={cStyle.flex1}
            onPress={onRemovePress}
            accessibilityHint={`Removes the current ${label.toLowerCase()}`}
          />
        )}
      </View>
    </View>
  );
}

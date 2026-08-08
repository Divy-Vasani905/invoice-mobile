import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/layout/Card';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';

import type { ProductListItem } from '../types/product.types';

export interface ProductCardProps {
  item: ProductListItem;
  onPress: (productId: string) => void;
  loading?: boolean;
}

export const ProductCard = memo(function ProductCard({
  item,
  onPress,
  loading = false,
}: ProductCardProps) {
  const { theme } = useTheme();
  const { product, formattedPrice, typeLabel, unitLabel } = item;

  return (
    <Card
      variant="outlined"
      pressable
      loading={loading}
      onPress={() => onPress(product.id)}
      accessibilityLabel={`${product.name}, ${typeLabel}, ${formattedPrice} per ${unitLabel}`}
      accessibilityHint="Opens the edit product form"
      padding="lg"
    >
      <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g12]}>
        <View style={[cStyle.flex1, cStyle.g4]} importantForAccessibility="no-hide-descendants">
          <ThemedText style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
            {product.name}
          </ThemedText>
          <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.g8, cStyle.flexWrap]}>
            <Badge label={typeLabel} variant="neutral" size="sm" />
            {!product.isActive && <Badge label="Inactive" variant="warning" size="sm" />}
            {product.sku != null && (
              <ThemedText style={[theme.typography.helper, { color: theme.colors.textTertiary }]}>
                SKU {product.sku}
              </ThemedText>
            )}
          </View>
          <ThemedText style={[theme.typography.helper, { color: theme.colors.textSecondary }]}>
            {formattedPrice} / {unitLabel}
          </ThemedText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={theme.iconSizes.md}
          color={theme.colors.textTertiary}
          importantForAccessibility="no"
        />
      </View>
    </Card>
  );
});

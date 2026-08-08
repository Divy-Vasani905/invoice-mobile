import { useLocalSearchParams } from 'expo-router';

import { ProductFormScreen } from '@/features/product/screens/ProductFormScreen';

export default function EditProductRoute() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  return <ProductFormScreen productId={productId} />;
}

import { useLocalSearchParams } from 'expo-router';

import { CustomerFormScreen } from '@/features/customer/screens/CustomerFormScreen';

export default function EditCustomerRoute() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  return <CustomerFormScreen customerId={customerId} />;
}

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { Card } from '@/components/layout/Card';
import { Header } from '@/components/layout/Header';
import { ListItem } from '@/components/layout/ListItem';
import { ThemedText } from '@/components/themed-text';
import { ROUTES } from '@/navigation';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { useBusiness } from '../hooks/useBusiness';
import { getBusinessInitials } from '../utils/business.utils';

export function BusinessProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { summary, isLoading, isError, isEmpty, refreshBusiness } = useBusiness();

  if (isLoading) return <Loader mode="fullScreen" text="Loading business profile" />;

  if (isError) {
    return (
      <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
        <Header title="Business Profile" onBack={() => router.back()} />
        <EmptyState
          title="Unable to load business"
          description="Your business profile could not be loaded."
          primaryAction={{ label: 'Retry', onPress: refreshBusiness }}
        />
      </View>
    );
  }

  if (isEmpty || summary == null) {
    return (
      <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
        <Header title="Business Profile" onBack={() => router.back()} />
        <EmptyState
          title="No business profile yet"
          description="Add your business details to automatically use them on invoices."
          icon={({ color, size }) => <Ionicons name="business-outline" color={color} size={size} />}
          primaryAction={{
            label: 'Add Business',
            onPress: () => router.push(ROUTES.businessForm),
          }}
        />
      </View>
    );
  }

  const { business, formattedAddress, hasLogo, hasSignature, hasDefaultNotes } = summary;

  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Business Profile"
        onBack={() => router.back()}
        rightActions={
          <Button
            label="Edit"
            size="sm"
            variant="ghost"
            onPress={() => router.push(ROUTES.businessForm)}
            accessibilityHint="Opens the edit business form"
          />
        }
      />
      <ScrollView
        contentContainerStyle={{
          gap: cStyleValues.spacing.lg,
          padding: cStyleValues.spacing.lg,
          paddingBottom: cStyleValues.spacing['3xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="outlined" padding="lg">
          <View style={[cStyle.itemCenter, cStyle.g12]}>
            <View
              style={[
                cStyle.itemCenter,
                cStyle.justifyCenter,
                cStyle.r16,
                {
                  width: cStyleValues.spacing['7xl'],
                  height: cStyleValues.spacing['7xl'],
                  overflow: 'hidden',
                  backgroundColor: theme.colors.primarySubtle,
                },
              ]}
            >
              {hasLogo && business.logoUri != null ? (
                <Image
                  source={{ uri: business.logoUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  accessibilityLabel="Business logo"
                />
              ) : (
                <ThemedText
                  style={[theme.typography.title, cStyle.fontBold, { color: theme.colors.primary }]}
                >
                  {getBusinessInitials(business.displayName)}
                </ThemedText>
              )}
            </View>
            <ThemedText
              style={[
                theme.typography.title,
                cStyle.textCenter,
                { color: theme.colors.textPrimary },
              ]}
            >
              {business.displayName}
            </ThemedText>
          </View>
        </Card>

        <Card variant="outlined" padding="none">
          {business.taxId != null && (
            <ListItem title="GST / Tax ID" subtitle={business.taxId} divider />
          )}
          {business.phone != null && <ListItem title="Phone" subtitle={business.phone} divider />}
          {business.email != null && <ListItem title="Email" subtitle={business.email} divider />}
          {business.website != null && (
            <ListItem title="Website" subtitle={business.website} divider />
          )}
          {formattedAddress.length > 0 && (
            <ListItem title="Address" subtitle={formattedAddress} divider />
          )}
          <ListItem
            title="Authorized Signature"
            subtitle={hasSignature ? 'Uploaded' : 'Not added'}
            divider
          />
          <ListItem
            title="Default Invoice Notes"
            subtitle={hasDefaultNotes ? 'Configured' : 'Not added'}
            divider={false}
          />
        </Card>

        <Button
          label="Edit Profile"
          onPress={() => router.push(ROUTES.businessForm)}
          leftIcon={({ color, size }) => (
            <Ionicons name="create-outline" color={color} size={size} />
          )}
          accessibilityHint="Opens the edit business form"
        />
      </ScrollView>
    </View>
  );
}

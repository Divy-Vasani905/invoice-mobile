import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Loader } from '@/components/feedback/Loader';
import { showToast } from '@/components/feedback/Toast';
import { Card } from '@/components/layout/Card';
import { Header } from '@/components/layout/Header';
import { ListItem } from '@/components/layout/ListItem';
import { ThemedText } from '@/components/themed-text';
import { formatCountryLabel, getCountryOptions } from '@/features/preferences/catalog';
import { SearchablePickerModal } from '@/features/preferences/components/SearchablePickerModal';
import { ROUTES } from '@/navigation';
import { useUserPreferencesStore } from '@/stores/user-preferences';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { useBusiness } from '../hooks/useBusiness';
import { getBusinessInitials } from '../utils/business.utils';

export function BusinessProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { summary, isLoading, isError, isEmpty, refreshBusiness } = useBusiness();
  const countryCode = useUserPreferencesStore((state) => state.countryCode);
  const setCountryCode = useUserPreferencesStore((state) => state.setCountryCode);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const countryItems = useMemo(
    () =>
      getCountryOptions().map((country) => ({
        id: country.code,
        title: `${country.flag}  ${country.name}`,
        subtitle: country.code,
      })),
    [],
  );

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
          <ListItem
            title="Country"
            subtitle={countryCode == null ? 'Not set' : formatCountryLabel(countryCode)}
            pressable
            divider
            onPress={() => setShowCountryPicker(true)}
            accessibilityHint="Opens the country picker"
          />
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
      <SearchablePickerModal
        visible={showCountryPicker}
        title="Select country"
        searchPlaceholder="Search country..."
        items={countryItems}
        selectedId={countryCode}
        onClose={() => setShowCountryPicker(false)}
        onSelect={(code) => {
          try {
            setCountryCode(code);
            showToast('success', { title: 'Country updated' });
          } catch {
            showToast('error', {
              title: 'Could not save country',
              message: 'Please try again.',
            });
          }
        }}
      />
    </View>
  );
}

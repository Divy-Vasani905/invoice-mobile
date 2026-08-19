import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { BackHandler } from 'react-native';

import { showToast } from '@/components/feedback/Toast';
import {
  formatCountryLabel,
  formatCurrencyLabel,
  getCountryOptions,
  getCurrencyOptions,
  getSuggestedCurrencyCode,
} from '@/features/preferences/catalog';
import { SearchablePickerModal } from '@/features/preferences/components/SearchablePickerModal';
import { ROUTES } from '@/navigation';
import { useUserPreferencesStore } from '@/stores/user-preferences';

import {
  OnboardingLayout,
  PreferenceSelectCard,
  type OnboardingStep,
} from '../components/OnboardingLayout';

export function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useUserPreferencesStore((state) => state.completeOnboarding);

  const [step, setStep] = useState<OnboardingStep>(0);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const countryOptions = useMemo(() => getCountryOptions(), []);
  const currencyOptions = useMemo(() => getCurrencyOptions(), []);

  const countryItems = useMemo(
    () =>
      countryOptions.map((country) => ({
        id: country.code,
        title: `${country.flag}  ${country.name}`,
        subtitle: country.code,
      })),
    [countryOptions],
  );

  const currencyItems = useMemo(
    () =>
      currencyOptions.map((currency) => ({
        id: currency.code,
        title: `${currency.symbol}  ${currency.code} — ${currency.name}`,
      })),
    [currencyOptions],
  );

  const goBack = useCallback(() => {
    if (step === 0) return true;
    setStep((current) => (current === 2 ? 1 : 0));
    return true;
  }, [step]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', goBack);
      return () => subscription.remove();
    }, [goBack]),
  );

  const finish = () => {
    if (countryCode == null || currencyCode == null) return;
    setSaving(true);
    try {
      completeOnboarding(countryCode, currencyCode);
      router.replace(ROUTES.dashboard);
    } catch {
      showToast('error', {
        title: 'Could not save preferences',
        message: 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (step === 0) {
    return (
      <OnboardingLayout
        step={0}
        title="Let's set up your invoice preferences"
        description="Tell us a few details so we can make invoice creation faster for you."
        primaryLabel="Get Started"
        onPrimary={() => setStep(1)}
      />
    );
  }

  if (step === 1) {
    return (
      <>
        <OnboardingLayout
          step={1}
          title="Where is your business located?"
          description="This helps us set up your invoice preferences."
          primaryLabel="Continue"
          primaryDisabled={countryCode == null}
          onBack={() => setStep(0)}
          onPrimary={() => setStep(2)}
        >
          <PreferenceSelectCard
            label="Country"
            value={countryCode == null ? null : formatCountryLabel(countryCode)}
            placeholder="Select country"
            onPress={() => setShowCountryPicker(true)}
          />
        </OnboardingLayout>
        <SearchablePickerModal
          visible={showCountryPicker}
          title="Select country"
          searchPlaceholder="Search country..."
          items={countryItems}
          selectedId={countryCode}
          onSelect={(code) => {
            setCountryCode(code);
            const suggested = getSuggestedCurrencyCode(code);
            if (suggested != null) setCurrencyCode(suggested);
          }}
          onClose={() => setShowCountryPicker(false)}
        />
      </>
    );
  }

  return (
    <>
      <OnboardingLayout
        step={2}
        title="What's your preferred currency?"
        description="You can change this later from Settings."
        primaryLabel="Finish"
        primaryDisabled={countryCode == null || currencyCode == null}
        primaryLoading={saving}
        onBack={() => setStep(1)}
        onPrimary={finish}
      >
        <PreferenceSelectCard
          label="Currency"
          value={currencyCode == null ? null : formatCurrencyLabel(currencyCode)}
          placeholder="Select currency"
          onPress={() => setShowCurrencyPicker(true)}
        />
      </OnboardingLayout>
      <SearchablePickerModal
        visible={showCurrencyPicker}
        title="Select currency"
        searchPlaceholder="Search currency..."
        items={currencyItems}
        selectedId={currencyCode}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={setCurrencyCode}
      />
    </>
  );
}

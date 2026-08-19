import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/layout/Card';
import { ThemedText } from '@/components/themed-text';
import { cStyle, useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import type { ReactNode } from 'react';

export type OnboardingStep = 0 | 1 | 2;

type OnboardingLayoutProps = {
  step: OnboardingStep;
  title: string;
  description: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  onPrimary: () => void;
  onBack?: () => void;
  children?: ReactNode;
};

const STEP_COUNT = 3;

export function OnboardingLayout({
  step,
  title,
  description,
  primaryLabel,
  primaryDisabled = false,
  primaryLoading = false,
  onPrimary,
  onBack,
  children,
}: OnboardingLayoutProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const progressLabel = `${step + 1} / ${STEP_COUNT}`;

  const dots = useMemo(
    () =>
      Array.from({ length: STEP_COUNT }, (_, index) => (
        <View
          key={index}
          style={{
            width: index === step ? 22 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: index === step ? theme.colors.primary : theme.colors.borderStrong,
          }}
        />
      )),
    [step, theme.colors.borderStrong, theme.colors.primary],
  );

  return (
    <View
      style={[
        cStyle.flex1,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + cStyleValues.spacing.lg,
          paddingBottom: insets.bottom + cStyleValues.spacing.lg,
        },
      ]}
    >
      <View style={[cStyle.ph20, cStyle.flexRow, cStyle.itemCenter, cStyle.justifyBetween]}>
        {onBack != null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={[cStyle.pv8, { minWidth: 64 }]}
          >
            <ThemedText style={[theme.typography.label, { color: theme.colors.primary }]}>
              Back
            </ThemedText>
          </Pressable>
        ) : (
          <View style={{ minWidth: 64 }} />
        )}
        <ThemedText style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
          {progressLabel}
        </ThemedText>
        <View style={{ minWidth: 64 }} />
      </View>

      <View style={[cStyle.flex1, cStyle.ph20, cStyle.pt24]}>
        {step === 0 && (
          <View style={[cStyle.itemCenter, cStyle.mb32]}>
            <View
              style={[
                cStyle.itemCenter,
                cStyle.justifyCenter,
                cStyle.r16,
                {
                  width: 96,
                  height: 96,
                  backgroundColor: theme.colors.primaryLogoBackground,
                  overflow: 'hidden',
                },
              ]}
            >
              <Image
                source={require('../../../../assets/images/invoice-base-icon.png')}
                style={{ width: 110, height: 110 }}
                contentFit="cover"
                accessibilityLabel="Easy Invoice Maker logo"
              />
            </View>
          </View>
        )}

        <ThemedText
          style={[theme.typography.headingL, cStyle.mb8, { color: theme.colors.textPrimary }]}
        >
          {title}
        </ThemedText>
        <ThemedText
          style={[theme.typography.bodySmall, cStyle.mb24, { color: theme.colors.textSecondary }]}
        >
          {description}
        </ThemedText>

        {children}
      </View>

      <View style={[cStyle.ph20, cStyle.g16]}>
        <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.justifyCenter, cStyle.g8]}>
          {dots}
        </View>
        <Button
          label={primaryLabel}
          onPress={onPrimary}
          disabled={primaryDisabled}
          loading={primaryLoading}
        />
      </View>
    </View>
  );
}

export function PreferenceSelectCard({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Card variant="outlined" pressable onPress={onPress} accessibilityLabel={label}>
      <ThemedText style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
        {label}
      </ThemedText>
      <View style={[cStyle.flexRow, cStyle.itemCenter, cStyle.justifyBetween, cStyle.mt8]}>
        <ThemedText
          style={[
            theme.typography.bodyMedium,
            { color: value == null ? theme.colors.textPlaceholder : theme.colors.textPrimary },
          ]}
        >
          {value ?? placeholder}
        </ThemedText>
        <ThemedText style={[theme.typography.title, { color: theme.colors.textTertiary }]}>
          ›
        </ThemedText>
      </View>
    </Card>
  );
}

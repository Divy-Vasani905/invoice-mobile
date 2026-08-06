import type { StackScreenOptions } from '@/navigation/types';
import type { AppTheme } from '@/theme';

/** Reusable "this navigator draws no header" options. */
export const HEADERLESS_SCREEN_OPTIONS: StackScreenOptions = {
  headerShown: false,
};

/**
 * Baseline options shared by every stack in the app. Individual screens layer
 * `createHeaderOptions` / `createModalScreenOptions` on top instead of
 * repeating header and background configuration.
 */
export function createStackScreenOptions(theme: AppTheme): StackScreenOptions {
  return {
    headerShown: true,
    headerTitleAlign: 'center',
    headerBackButtonDisplayMode: 'minimal',
    headerShadowVisible: false,
    headerTintColor: theme.colors.primary,
    headerStyle: { backgroundColor: theme.colors.surface },
    headerTitleStyle: {
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.title.fontFamily,
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
    },
    contentStyle: { backgroundColor: theme.colors.background },
    animation: 'slide_from_right',
    gestureEnabled: true,
    freezeOnBlur: true,
  };
}

export type HeaderOptionsInput = {
  title: string;
  /** iOS large title treatment for the root screen of a module stack. */
  largeTitle?: boolean;
  /** Hide the header entirely while keeping the title for accessibility. */
  hidden?: boolean;
};

/**
 * Reusable per-screen header configuration. Keeps every `Stack.Screen`
 * declaration down to a title plus intent.
 */
export function createHeaderOptions({
  title,
  largeTitle = false,
  hidden = false,
}: HeaderOptionsInput): StackScreenOptions {
  return {
    title,
    headerShown: !hidden,
    headerLargeTitle: largeTitle,
  };
}

export type ModalOptionsInput = HeaderOptionsInput & {
  /** Sheet stops as fractions of the window height, ascending. */
  detents?: number[];
};

/**
 * Standard modal route: slides up as its own card, keeps a header so the
 * screen stays dismissible on every platform including web.
 */
export function createModalScreenOptions(
  theme: AppTheme,
  input: HeaderOptionsInput,
): StackScreenOptions {
  return {
    ...createHeaderOptions(input),
    presentation: 'modal',
    animation: 'slide_from_bottom',
    headerStyle: { backgroundColor: theme.colors.modal },
    contentStyle: { backgroundColor: theme.colors.modal },
  };
}

/**
 * Bottom-sheet modal for short, focused tasks. Android caps out at three
 * detents, so keep the list small.
 */
export function createFormSheetScreenOptions(
  theme: AppTheme,
  { detents = [0.5, 1], ...input }: ModalOptionsInput,
): StackScreenOptions {
  return {
    ...createModalScreenOptions(theme, input),
    presentation: 'formSheet',
    sheetAllowedDetents: detents,
    sheetGrabberVisible: true,
    sheetCornerRadius: theme.cards.layout.radius,
  };
}

/**
 * Edge-to-edge modal for immersive content such as the generated PDF preview.
 */
export function createFullScreenModalScreenOptions(
  theme: AppTheme,
  input: HeaderOptionsInput,
): StackScreenOptions {
  return {
    ...createModalScreenOptions(theme, input),
    presentation: 'fullScreenModal',
    contentStyle: { backgroundColor: theme.colors.background },
  };
}

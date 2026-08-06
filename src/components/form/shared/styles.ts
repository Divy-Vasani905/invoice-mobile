import type { InputState } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';
import type { AppTheme } from '@/theme/types';

import type { FormControlSize } from './types';
import type { TextStyle, ViewStyle } from 'react-native';

export type FieldStyles = {
  container: ViewStyle;
  label: TextStyle;
  required: TextStyle;
  control: ViewStyle;
  input: TextStyle;
  adornment: TextStyle;
  helper: TextStyle;
  error: TextStyle;
  iconColor: string;
  iconSize: number;
};

export function resolveFieldState(
  disabled: boolean,
  focused: boolean,
  hasError: boolean,
): InputState {
  if (disabled) return 'disabled';
  if (hasError) return 'error';
  return focused ? 'focused' : 'default';
}

export function getFieldStyles(
  theme: AppTheme,
  state: InputState,
  size: FormControlSize,
): FieldStyles {
  const layout = theme.inputs.layout;
  const controlSize = theme.buttons.sizes[size];
  const colors = theme.inputs.states[state];

  return {
    container: {
      gap: layout.gap,
    },
    label: {
      ...theme.typography[layout.labelTypography],
      color: theme.colors[colors.label],
    },
    required: {
      ...theme.typography[layout.labelTypography],
      color: theme.colors.danger,
    },
    control: {
      minHeight: controlSize.minHeight,
      paddingHorizontal: controlSize.paddingHorizontal,
      paddingVertical: controlSize.paddingVertical,
      gap: layout.gap,
      borderRadius: controlSize.radius,
      borderWidth: state === 'focused' ? layout.focusedBorderWidth : layout.borderWidth,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors[colors.background],
      borderColor: theme.colors[colors.border],
    },
    input: {
      ...theme.typography[layout.typography],
      flex: 1,
      padding: cStyleValues.spacing.none,
      color: theme.colors[colors.text],
    },
    adornment: {
      ...theme.typography[layout.typography],
      color: theme.colors[colors.text],
    },
    helper: {
      ...theme.typography[layout.helperTypography],
      color: theme.colors[colors.helper],
    },
    error: {
      ...theme.typography[layout.errorTypography],
      color: theme.colors.danger,
    },
    iconColor: theme.colors[colors.icon],
    iconSize: theme.iconSizes.md,
  };
}

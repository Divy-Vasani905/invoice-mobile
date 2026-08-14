import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

/**
 * Single source of truth for layout CSS utilities in this app.
 *
 * Use this file everywhere for padding, margin, gap, radius, flex, alignment,
 * font size/weight, opacity, and zIndex. Do not recreate these values in
 * theme objects or local StyleSheets.
 *
 * Examples:
 * - `cStyle.p16` → padding: 16
 * - `cStyle.ph8` → paddingHorizontal: 8
 * - `cStyle.itemCenter` → alignItems: 'center'
 *
 * Theme colors / light-dark values still come from `useTheme()`:
 * `[cStyle.p16, cStyle.flexRow, { backgroundColor: colors.card }]`
 */
type SharedStyle = ViewStyle & TextStyle & ImageStyle;

/**
 * Internal numeric values used by the design system component tokens.
 * Application UI should use `cStyle.p16`, `cStyle.r12`, etc. directly.
 */
export const cStyleValues = {
  spacing: {
    none: 0,
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 56,
    '7xl': 64,
  },
  radius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },
  opacity: {
    transparent: 0,
    faint: 0.04,
    subtle: 0.08,
    muted: 0.16,
    soft: 0.24,
    medium: 0.4,
    strong: 0.64,
    heavy: 0.8,
    opaque: 1,
  },
  zIndex: {
    base: 0,
    raised: 1,
    dropdown: 10,
    sticky: 20,
    header: 30,
    fab: 40,
    overlay: 50,
    modal: 60,
    popover: 70,
    toast: 80,
    tooltip: 90,
    max: 999,
  },
} as const;

/** @deprecated Prefer `cStyle.p*` / `cStyle.m*` in application UI. */
export const spacing = cStyleValues.spacing;
/** @deprecated Prefer `cStyle.r*` in application UI. */
export const radius = cStyleValues.radius;
/** @deprecated Prefer `cStyle.opacity*` in application UI. */
export const opacity = cStyleValues.opacity;
/** @deprecated Prefer `cStyle.z*` in application UI. */
export const zIndex = cStyleValues.zIndex;

export type SpacingToken = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingToken];
export type RadiusToken = keyof typeof radius;
export type RadiusValue = (typeof radius)[RadiusToken];
export type OpacityToken = keyof typeof opacity;
export type OpacityValue = (typeof opacity)[OpacityToken];
export type ZIndexToken = keyof typeof zIndex;
export type ZIndexValue = (typeof zIndex)[ZIndexToken];

type SpacingPrefix =
  | 'p'
  | 'pt'
  | 'pr'
  | 'pb'
  | 'pl'
  | 'ph'
  | 'pv'
  | 'm'
  | 'mt'
  | 'mr'
  | 'mb'
  | 'ml'
  | 'mh'
  | 'mv'
  | 'g';
type SpacingStyleKey = `${SpacingPrefix}${SpacingValue}`;

type RadiusStyleValue = 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 9999;
type RadiusStyleKey = `r${RadiusStyleValue}`;

type FontSize = 11 | 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 40 | 48;
type FontSizeStyleKey = `f${FontSize}`;

type AtomicStyles = Record<SpacingStyleKey | RadiusStyleKey, SharedStyle> &
  Record<FontSizeStyleKey, TextStyle> & {
    opacity0: SharedStyle;
    opacity4: SharedStyle;
    opacity8: SharedStyle;
    opacity16: SharedStyle;
    opacity24: SharedStyle;
    opacity40: SharedStyle;
    opacity64: SharedStyle;
    opacity70: SharedStyle;
    opacity80: SharedStyle;
    opacity100: SharedStyle;
    z0: SharedStyle;
    z1: SharedStyle;
    z10: SharedStyle;
    z20: SharedStyle;
    z30: SharedStyle;
    z40: SharedStyle;
    z50: SharedStyle;
    z60: SharedStyle;
    z70: SharedStyle;
    z80: SharedStyle;
    z90: SharedStyle;
    z100: SharedStyle;
    z999: SharedStyle;
    z1000: SharedStyle;
    itemStart: ViewStyle;
    itemCenter: ViewStyle;
    itemEnd: ViewStyle;
    itemStretch: ViewStyle;
    itemBaseline: ViewStyle;
    selfStart: ViewStyle & ImageStyle;
    selfCenter: ViewStyle & ImageStyle;
    selfEnd: ViewStyle & ImageStyle;
    selfStretch: ViewStyle & ImageStyle;
    justifyStart: ViewStyle;
    justifyCenter: ViewStyle;
    justifyEnd: ViewStyle;
    justifyBetween: ViewStyle;
    justifyAround: ViewStyle;
    justifyEvenly: ViewStyle;
    flex0: ViewStyle;
    flex1: ViewStyle;
    flex2: ViewStyle;
    flex3: ViewStyle;
    flex4: ViewStyle;
    flex5: ViewStyle;
    flex10: ViewStyle;
    flexRow: ViewStyle;
    flexRowReverse: ViewStyle;
    flexColumn: ViewStyle;
    flexColumnReverse: ViewStyle;
    flexWrap: ViewStyle;
    flexNoWrap: ViewStyle;
    flexGrow: ViewStyle;
    flexShrink: ViewStyle;
    textLeft: TextStyle;
    textCenter: TextStyle;
    textRight: TextStyle;
    textJustify: TextStyle;
    fontRegular: TextStyle;
    fontMedium: TextStyle;
    fontSemiBold: TextStyle;
    fontBold: TextStyle;
  };

const spacingValues = Object.values(spacing) as readonly SpacingValue[];
const radiusValues = [0, 4, 8, 12, 16, 20, 24, 32, 40, 9999] as const;
const fontSizes = [11, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48] as const;

const spacingStyles = spacingValues.reduce<Partial<AtomicStyles>>((styles, value) => {
  const key = String(value) as `${SpacingValue}`;

  styles[`p${key}`] = { padding: value };
  styles[`pt${key}`] = { paddingTop: value };
  styles[`pr${key}`] = { paddingRight: value };
  styles[`pb${key}`] = { paddingBottom: value };
  styles[`pl${key}`] = { paddingLeft: value };
  styles[`ph${key}`] = { paddingHorizontal: value };
  styles[`pv${key}`] = { paddingVertical: value };

  styles[`m${key}`] = { margin: value };
  styles[`mt${key}`] = { marginTop: value };
  styles[`mr${key}`] = { marginRight: value };
  styles[`mb${key}`] = { marginBottom: value };
  styles[`ml${key}`] = { marginLeft: value };
  styles[`mh${key}`] = { marginHorizontal: value };
  styles[`mv${key}`] = { marginVertical: value };
  styles[`g${key}`] = { gap: value };

  return styles;
}, {});

const radiusStyles = radiusValues.reduce<Partial<AtomicStyles>>((styles, value) => {
  styles[`r${value}`] = { borderRadius: value };
  return styles;
}, {});

const fontSizeStyles = fontSizes.reduce<Partial<AtomicStyles>>((styles, value) => {
  styles[`f${value}`] = { fontSize: value };
  return styles;
}, {});

export const cStyle = {
  ...spacingStyles,
  ...radiusStyles,
  ...fontSizeStyles,

  opacity0: { opacity: opacity.transparent },
  opacity4: { opacity: opacity.faint },
  opacity8: { opacity: opacity.subtle },
  opacity16: { opacity: opacity.muted },
  opacity24: { opacity: opacity.soft },
  opacity40: { opacity: opacity.medium },
  opacity64: { opacity: opacity.strong },
  opacity70: { opacity: 0.7 },
  opacity80: { opacity: opacity.heavy },
  opacity100: { opacity: opacity.opaque },

  z0: { zIndex: zIndex.base },
  z1: { zIndex: zIndex.raised },
  z10: { zIndex: zIndex.dropdown },
  z20: { zIndex: zIndex.sticky },
  z30: { zIndex: zIndex.header },
  z40: { zIndex: zIndex.fab },
  z50: { zIndex: zIndex.overlay },
  z60: { zIndex: zIndex.modal },
  z70: { zIndex: zIndex.popover },
  z80: { zIndex: zIndex.toast },
  z90: { zIndex: zIndex.tooltip },
  z100: { zIndex: 100 },
  z999: { zIndex: zIndex.max },
  z1000: { zIndex: 1000 },

  itemStart: { alignItems: 'flex-start' },
  itemCenter: { alignItems: 'center' },
  itemEnd: { alignItems: 'flex-end' },
  itemStretch: { alignItems: 'stretch' },
  itemBaseline: { alignItems: 'baseline' },

  selfStart: { alignSelf: 'flex-start' },
  selfCenter: { alignSelf: 'center' },
  selfEnd: { alignSelf: 'flex-end' },
  selfStretch: { alignSelf: 'stretch' },

  justifyStart: { justifyContent: 'flex-start' },
  justifyCenter: { justifyContent: 'center' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
  justifyEvenly: { justifyContent: 'space-evenly' },

  flex0: { flex: 0 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  flex4: { flex: 4 },
  flex5: { flex: 5 },
  flex10: { flex: 10 },
  flexRow: { flexDirection: 'row' },
  flexRowReverse: { flexDirection: 'row-reverse' },
  flexColumn: { flexDirection: 'column' },
  flexColumnReverse: { flexDirection: 'column-reverse' },
  flexWrap: { flexWrap: 'wrap' },
  flexNoWrap: { flexWrap: 'nowrap' },
  flexGrow: { flexGrow: 1 },
  flexShrink: { flexShrink: 1 },

  textLeft: { textAlign: 'left' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textJustify: { textAlign: 'justify' },
  fontRegular: { fontWeight: '400' },
  fontMedium: { fontWeight: '500' },
  fontSemiBold: { fontWeight: '600' },
  fontBold: { fontWeight: '700' },
} as AtomicStyles;

export type { AtomicStyles };

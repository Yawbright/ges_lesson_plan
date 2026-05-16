/**
 * Design tokens for GES Lesson Planner.
 *
 * Modernized Ghana-inspired palette: refined evergreen primary, warm gold accent,
 * carefully tuned neutrals for content density. Light + dark variants follow the
 * system color scheme.
 *
 * NOTE: legacy keys on `palette.light` are preserved so existing screens that
 * import `colors` from `@/theme/colors` continue to compile and now look better
 * automatically.
 */

import { Platform } from 'react-native';

// --- Brand palette (raw colors) ------------------------------------------------

const brand = {
  // Refined evergreen — slightly cooler / more modern than the old #0E5F47
  forest900: '#0A2E25',
  forest800: '#0E3D31',
  forest700: '#125243',
  forest600: '#176B57',
  forest500: '#1F8A6F', // primary
  forest400: '#3FA98C',
  forest300: '#6FC2AB',
  forest200: '#B6E0D2',
  forest100: '#E0F1EA',
  forest50: '#F1F8F4',

  // Warm gold — Ghana flag–inspired accent
  gold700: '#A07308',
  gold600: '#C28B0F',
  gold500: '#E0A82E',
  gold400: '#F0BD55',
  gold300: '#F7D896',
  gold200: '#FBE9C2',
  gold100: '#FDF4DE',

  // Heritage red — restrained, used only for errors/destructive
  red700: '#9B0E1D',
  red600: '#C2122A',
  red500: '#DC2A3F',
  red400: '#E85D6E',
  red100: '#FDECEE',

  // Neutrals — warm-tinted, paper-feel
  ink900: '#0B1410',
  ink800: '#101D17',
  ink700: '#17221C',
  ink600: '#374A41',
  ink500: '#5F6E66',
  ink400: '#8B968F',
  ink300: '#B6BEB9',
  ink200: '#D9DEDB',
  ink100: '#ECEFEC',
  ink50: '#F4F6F4',
  paper: '#FBFBFA',
  white: '#FFFFFF',
  black: '#000000',
};

// --- Semantic palette ----------------------------------------------------------

export type ColorPalette = {
  // Brand
  primary: string;
  primaryDark: string;
  primarySoft: string;
  primaryOn: string; // text/icon color when sitting on `primary`
  accent: string;
  accentSoft: string;
  accentOn: string;
  danger: string;
  dangerSoft: string;
  dangerOn: string;
  success: string;
  successSoft: string;
  info: string;
  infoSoft: string;

  // Surface
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceMuted: string;
  surfaceAlt: string;
  overlay: string;

  // Borders
  border: string;
  borderStrong: string;
  borderSubtle: string;

  // Text
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  textOnPrimary: string;

  // Tables (used by LessonPlanTable & SchemeTable)
  tableHeader: string;
  tableHeaderText: string;
  tableRowAlt: string;

  // Misc accents
  shadow: string;
};

export const lightPalette: ColorPalette = {
  primary: brand.forest500,
  primaryDark: brand.forest700,
  primarySoft: brand.forest100,
  primaryOn: brand.white,
  accent: brand.gold500,
  accentSoft: brand.gold100,
  accentOn: brand.ink900,
  danger: brand.red600,
  dangerSoft: brand.red100,
  dangerOn: brand.white,
  success: brand.forest500,
  successSoft: brand.forest100,
  info: brand.forest700,
  infoSoft: brand.forest100,

  bg: brand.ink50,
  bgElevated: brand.white,
  surface: brand.white,
  surfaceMuted: brand.ink100,
  surfaceAlt: brand.forest50,
  overlay: 'rgba(11, 20, 16, 0.5)',

  border: brand.ink200,
  borderStrong: brand.ink300,
  borderSubtle: brand.ink100,

  text: brand.ink900,
  textMuted: brand.ink600,
  textSubtle: brand.ink500,
  textInverse: brand.white,
  textOnPrimary: brand.white,

  tableHeader: brand.forest700,
  tableHeaderText: brand.white,
  tableRowAlt: brand.forest50,

  shadow: 'rgba(11, 46, 37, 0.10)',
};

export const darkPalette: ColorPalette = {
  primary: brand.forest400,
  primaryDark: brand.forest300,
  primarySoft: 'rgba(31, 138, 111, 0.18)',
  primaryOn: brand.ink900,
  accent: brand.gold400,
  accentSoft: 'rgba(224, 168, 46, 0.18)',
  accentOn: brand.ink900,
  danger: brand.red400,
  dangerSoft: 'rgba(220, 42, 63, 0.20)',
  dangerOn: brand.white,
  success: brand.forest400,
  successSoft: 'rgba(31, 138, 111, 0.18)',
  info: brand.forest300,
  infoSoft: 'rgba(31, 138, 111, 0.18)',

  bg: '#07120E',
  bgElevated: '#0F1C17',
  surface: '#13231C',
  surfaceMuted: '#1A2D24',
  surfaceAlt: '#172A22',
  overlay: 'rgba(0, 0, 0, 0.6)',

  border: '#22382E',
  borderStrong: '#2F4A3D',
  borderSubtle: '#1A2D24',

  text: '#F1F8F4',
  textMuted: '#A9B8B0',
  textSubtle: '#7E8D85',
  textInverse: brand.ink900,
  textOnPrimary: brand.ink900,

  tableHeader: '#0F1C17',
  tableHeaderText: '#F1F8F4',
  tableRowAlt: '#172A22',

  shadow: 'rgba(0, 0, 0, 0.45)',
};

// --- Spacing / radii / shadows / typography ------------------------------------

export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 12,
  6: 16,
  7: 20,
  8: 24,
  9: 28,
  10: 32,
  11: 40,
  12: 48,
  13: 56,
  14: 64,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

const isWeb = Platform.OS === 'web';

export const shadows = {
  none: {},
  sm: isWeb
    ? { boxShadow: '0 1px 2px rgba(11, 46, 37, 0.06), 0 1px 3px rgba(11, 46, 37, 0.04)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
      },
  md: isWeb
    ? { boxShadow: '0 4px 12px rgba(11, 46, 37, 0.08), 0 2px 4px rgba(11, 46, 37, 0.04)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
  lg: isWeb
    ? { boxShadow: '0 10px 24px rgba(11, 46, 37, 0.12), 0 4px 8px rgba(11, 46, 37, 0.06)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 10,
      },
} as const;

// Typography scale (use these instead of hard-coded font sizes going forward)
export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.6 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  h4: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodySm: { fontSize: 13, lineHeight: 20, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0.1 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const, letterSpacing: 0.2 },
} as const;

export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type Shadows = typeof shadows;

// --- Brand identity ------------------------------------------------------------

export const brandIdentity = {
  name: 'GES Lesson Planner',
  shortName: 'GES Planner',
  tagline: 'Smart lesson plans for Ghanaian classrooms',
  description: 'AI-powered lesson plans, schemes of work, and teaching notes — built for Ghanaian teachers.',
  themeColor: brand.forest500,
  themeColorDark: brand.forest400,
} as const;

export { brand };

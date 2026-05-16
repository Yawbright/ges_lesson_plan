/**
 * Backwards-compatible color export.
 *
 * The app's older screens import `colors` from this module and use specific keys
 * (primary, primaryDark, primarySoft, accent, danger, bg, surface, surfaceMuted,
 * border, borderStrong, text, textMuted, tableHeader, tableHeaderText,
 * tableRowAlt, dangerSoft, accentSoft). All of those keys are preserved here and
 * now resolve to the modernized GES Lesson Planner palette (see `./tokens.ts`).
 *
 * New code should prefer `useTheme()` from `./ThemeProvider` to support dark mode.
 */

import { lightPalette } from './tokens';

export const colors = {
  ...lightPalette,
} as const;

export type Colors = typeof colors;

// Re-export design tokens for convenience.
export {
  brandIdentity,
  darkPalette,
  lightPalette,
  radii,
  shadows,
  spacing,
  typography,
} from './tokens';
export { useTheme, ThemeProvider } from './ThemeProvider';
export type { Theme, ThemeMode } from './ThemeProvider';

// Ghana-inspired palette: green, gold, red accents on neutral surfaces.
export const colors = {
  primary: '#0F4C3A',
  primaryDark: '#0A3326',
  accent: '#F2B233',
  danger: '#CE1126',
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  border: '#E5E5E0',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  tableHeader: '#0F4C3A',
  tableHeaderText: '#FFFFFF',
  tableRowAlt: '#F4F1EA',
} as const;

export type Colors = typeof colors;

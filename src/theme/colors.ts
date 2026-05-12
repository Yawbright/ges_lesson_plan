// Professional Ghana-inspired palette with restrained neutrals.
export const colors = {
  primary: '#0E5F47',
  primaryDark: '#063B2D',
  primarySoft: '#EAF5F0',
  accent: '#DFA617',
  accentSoft: '#FFF7DD',
  danger: '#CE1126',
  dangerSoft: '#FFF1F1',
  bg: '#F6F7F5',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F3F1',
  border: '#DDE3DF',
  borderStrong: '#C7D0CB',
  text: '#17211C',
  textMuted: '#66736C',
  tableHeader: '#0E5F47',
  tableHeaderText: '#FFFFFF',
  tableRowAlt: '#F1F4F2',
} as const;

export type Colors = typeof colors;

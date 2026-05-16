import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance } from 'react-native';
import {
  brandIdentity,
  darkPalette,
  lightPalette,
  radii,
  shadows,
  spacing,
  typography,
  type ColorPalette,
} from './tokens';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
  typography: typeof typography;
  brand: typeof brandIdentity;
}

function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'dark' ? darkPalette : lightPalette,
    spacing,
    radii,
    shadows,
    typography,
    brand: brandIdentity,
  };
}

const ThemeContext = createContext<Theme>(buildTheme('light'));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const scheme = Appearance.getColorScheme();
    return scheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setMode(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => listener.remove();
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

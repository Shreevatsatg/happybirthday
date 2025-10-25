import { Colors } from '@/constants/theme';
import { useThemeContext } from '@/context/ThemeContext';

export function useTheme() {
  const { colorScheme, theme, setColorScheme } = useThemeContext();
  const colors = Colors[colorScheme];

  return {
    colorScheme,
    theme,
    setColorScheme,
    isDark: colorScheme === 'dark',
    colors,
  };
}

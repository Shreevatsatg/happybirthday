import { Colors } from '@/constants/theme';
import { useColorScheme } from './use-color-scheme';

export function useTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  return {
    colorScheme,
    isDark: colorScheme === 'dark',
    colors,
  };
}
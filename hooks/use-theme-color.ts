/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useThemeContext } from '@/context/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string; forest?: string; ocean?: string; sunset?: string },
  colorName: keyof (typeof Colors)['light' | 'dark' | 'forest' | 'ocean' | 'sunset']
) {
  const { colorScheme } = useThemeContext();
  const theme = colorScheme ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

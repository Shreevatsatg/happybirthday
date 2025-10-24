import { useTheme } from '@/hooks/useTheme';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  surface?: boolean;
};

export function ThemedView({ style, surface, ...otherProps }: ThemedViewProps) {
  const { colors } = useTheme();
  const backgroundColor = surface ? colors.surface : colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

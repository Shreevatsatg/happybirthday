import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';

const APPEARANCE_OPTIONS = [
  { key: 'system', label: 'System', icon: 'cog-outline' },
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
  { key: 'forest', label: 'Forest', icon: 'leaf-outline' },
  { key: 'ocean', label: 'Ocean', icon: 'water-outline' },
  { key: 'sunset', label: 'Sunset', icon: 'partly-sunny-outline' },
];

export default function AppearanceScreen() {
  const { colors, theme, setColorScheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        {APPEARANCE_OPTIONS.map((option, index) => (
          <Pressable
            key={option.key}
            style={[
              styles.option,
              index < APPEARANCE_OPTIONS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
            ]}
            onPress={() => setColorScheme(option.key as any)}
          >
            <View style={styles.optionInfo}>
              <Ionicons name={option.icon as any} size={22} color={colors.icon} />
              <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
            </View>
            {theme === option.key && (
              <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
            )}
          </Pressable>
        ))}
      </View>
      <ThemedText secondary style={styles.footerText}>
        Choosing 'System' will automatically adapt the theme to your device's settings.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 16,
    paddingLeft: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 16,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionLabel: {
    fontSize: 16,
  },
  footerText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    paddingHorizontal: 20,
  },
});

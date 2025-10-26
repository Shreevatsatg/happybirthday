import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';

const APPEARANCE_OPTIONS = [
  { key: 'system', label: 'System', icon: 'cog-outline', colors: ['#666', '#999'] },
  { key: 'light', label: 'Light', icon: 'sunny-outline', colors: ['#fff', '#f5f5f5'] },
  { key: 'dark', label: 'Dark', icon: 'moon-outline', colors: ['#1a1a1a', '#000'] },
  { key: 'forest', label: 'Forest', icon: 'leaf-outline', colors: ['#2d5016', '#4a7c2f'] },
  { key: 'ocean', label: 'Ocean', icon: 'water-outline', colors: ['#0077be', '#005a8f'] },
  { key: 'sunset', label: 'Sunset', icon: 'partly-sunny-outline', colors: ['#ff6b35', '#f7931e'] },
  { key: 'mint', label: 'Mint', icon: 'ice-cream-outline', colors: ['#3eb489', '#98d8c8'] },
  { key: 'rose', label: 'Rose', icon: 'rose-outline', colors: ['#e63946', '#f08080'] },
  { key: 'midnight', label: 'Midnight', icon: 'cloudy-night-outline', colors: ['#191970', '#000080'] },
  { key: 'peach', label: 'Peach', icon: 'heart-outline', colors: ['#ffcba4', '#ff9a76'] },
  { key: 'cherry', label: 'Cherry', icon: 'heart-circle-outline', colors: ['#990000', '#cc0000'] },
  { key: 'sky', label: 'Sky', icon: 'cloud-outline', colors: ['#87ceeb', '#4a90e2'] },
  { key: 'honey', label: 'Honey', icon: 'aperture-outline', colors: ['#ffa500', '#ffb84d'] },
  { key: 'grape', label: 'Grape', icon: 'nutrition-outline', colors: ['#6a0dad', '#8b4ed9'] },
  { key: 'coral', label: 'Coral', icon: 'color-palette-outline', colors: ['#ff7f50', '#ff6347'] },
  { key: 'emerald', label: 'Emerald', icon: 'diamond-outline', colors: ['#50c878', '#2ecc71'] },
];

export default function AppearanceScreen() {
  const { colors, theme, setColorScheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsGrid}>
          {APPEARANCE_OPTIONS.map((option) => {
            const isSelected = theme === option.key;
            
            return (
              <Pressable
                key={option.key}
                style={[
                  styles.option,
                  { 
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.tint : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => setColorScheme(option.key as any)}
              >
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: colors.tint }]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
                
                <View style={styles.colorPreview}>
                  {option.colors.map((color, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        idx === 0 && styles.firstSwatch,
                      ]}
                    />
                  ))}
                </View>
                
                <View style={styles.optionContent}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={isSelected ? colors.tint : colors.icon} 
                  />
                  <ThemedText 
                    style={[
                      styles.optionLabel,
                      isSelected && { color: colors.tint, fontWeight: '600' }
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={{ height: 24 }} />
        <View style={[styles.legendSection, { backgroundColor: 'transparent' }]}>
          <Ionicons name="information-circle" size={20} color={colors.accent} />
        <ThemedText secondary style={styles.footerText}>
        System theme adapts to your device settings
      </ThemedText>
      </View>
      </ScrollView>
      
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  optionsGrid: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPreview: {
    flexDirection: 'row',
    height: 36,
    width: 36,
    borderRadius: 8,
    overflow: 'hidden',
  },
  colorSwatch: {
    flex: 1,
  },
  firstSwatch: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
  },
  legendSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 12,
  },
});
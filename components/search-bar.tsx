import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';

export function SearchBar({ onSearch, ...props }: { onSearch: (query: string) => void }) {
  const { colors } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchWrapper, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.icon} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Search by name, group, or note..."
          placeholderTextColor={colors.icon}
          onChangeText={onSearch}
          {...props}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    fontWeight: '500',
  },
});

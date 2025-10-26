import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';
import { Birthday } from '@/types/birthday';
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';

export default function SearchScreen() {
  const { birthdays, loading, refetch } = useBirthdays();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft === 0) return colors.error;
    if (daysLeft <= 3) return '#FF6B6B';
    if (daysLeft <= 7) return '#FFA500';
    return '#4CAF50';
  };

  const searchedBirthdays = birthdays
    ? birthdays.filter((b) => {
        const searchTerm = searchQuery.toLowerCase();
        const date = new Date(b.date);
        const month = date.toLocaleString('default', { month: 'long' }).toLowerCase();
        const day = date.getDate().toString();

        return (
          b.name.toLowerCase().includes(searchTerm) ||
          (b.group && b.group.toLowerCase().includes(searchTerm)) ||
          (b.note && b.note.toLowerCase().includes(searchTerm)) ||
          month.includes(searchTerm) ||
          day.includes(searchTerm)
        );
      })
    : [];

  const renderBirthday = ({ item: birthday }: { item: Birthday }) => (
    <Link href={{ pathname: '/birthday-details', params: { id: birthday.id } }} asChild key={birthday.id}>
      <Pressable>
        {({ pressed }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              },
            ]}>
            <View style={styles.cardLeft}>
              <View style={[styles.dateCircle, { backgroundColor: colors.border }]}>
                <ThemedText style={styles.dateMonth}>
                  {new Date(birthday.date).toLocaleString('default', { month: 'short' })}
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.dateDay}>
                  {new Date(birthday.date).getDate()}
                </ThemedText>
              </View>
              <View style={styles.cardInfo}>
                <ThemedText type="defaultSemiBold" style={styles.name}>
                  {birthday.name}
                </ThemedText>
                <View style={styles.detailsRow}>
                  <ThemedText secondary style={styles.cardSubtitle}>
                    {birthday.group ? birthday.group.charAt(0).toUpperCase() + birthday.group.slice(1) : 'Other'}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.rightSection}>
              <View style={[styles.daysChip, { backgroundColor: `${getUrgencyColor(birthday.daysLeft!)}15` }]}>
                <Ionicons name="time-outline" size={14} color={getUrgencyColor(birthday.daysLeft!)} />
                <ThemedText style={[styles.daysText, { color: getUrgencyColor(birthday.daysLeft!) }]}>
                  {birthday.daysLeft}d
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.icon} style={{ opacity: 0.3 }} />
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );

  const renderEmptyState = () => {
    if (searchQuery) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.icon} />
          <ThemedText type="subtitle" style={styles.emptyText}>
            No results found
          </ThemedText>
          <ThemedText secondary style={styles.emptySubtext}>
            Try searching for something else.
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={64} color={colors.icon} />
        <ThemedText type="subtitle" style={styles.emptyText}>
          No birthdays to search
        </ThemedText>
        <ThemedText secondary style={styles.emptySubtext}>
          Add some birthdays to see them here.
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SearchBar onSearch={setSearchQuery} />
      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
      ) : searchedBirthdays.length > 0 ? (
        <FlatList
          data={searchedBirthdays}
          renderItem={renderBirthday}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyState()
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  dateCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardSubtitle: {
    fontSize: 13,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  daysText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

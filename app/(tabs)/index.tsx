import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const { todaysBirthdays, upcomingBirthdays, loading, error } = useBirthdays();
  const { colors } = useTheme();

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) return colors.error;
    if (daysLeft <= 7) return colors.warning;
    return colors.success;
  };

  if (loading) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading birthdays...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        <ThemedText secondary style={styles.errorSubtext}>Please check your Supabase connection and try again.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <ThemedText type="title">Birthdays</ThemedText>
          </View>

          {/* Today's Birthdays */}
          {todaysBirthdays.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Today</ThemedText>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{todaysBirthdays.length}</ThemedText>
                </View>
              </View>
              {todaysBirthdays.map((birthday) => (
                <Pressable key={birthday.id}>
                  <View style={[styles.todayCard, {
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }]}>
                    <View style={styles.cardLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: colors.error }]}>
                        <Ionicons name="gift" size={20} color={colors.surface} />
                      </View>
                      <View style={styles.cardInfo}>
                        <ThemedText type="defaultSemiBold" style={styles.name}>
                          {birthday.name}
                        </ThemedText>
                        <ThemedText secondary style={styles.subtitle}>Turning {birthday.age} today</ThemedText>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Upcoming Birthdays */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Upcoming</ThemedText>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{upcomingBirthdays.length}</ThemedText>
              </View>
            </View>
            {upcomingBirthdays.map((birthday) => (
              <Pressable key={birthday.id}>
                <View style={[styles.card, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }]}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.border }]}>
                      <ThemedText style={styles.dateDay}>{birthday.date.split(' ')[1]}</ThemedText>
                    </View>
                    <View style={styles.cardInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.name}>
                        {birthday.name}
                      </ThemedText>
                      <ThemedText style={styles.subtitle}>{birthday.date}</ThemedText>
                    </View>
                  </View>
                  <View style={[styles.daysChip, { backgroundColor: `${getUrgencyColor(birthday.daysLeft)}15` }]}>
                    <ThemedText style={[styles.daysText, { color: getUrgencyColor(birthday.daysLeft) }]}>
                      {birthday.daysLeft}d
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Empty state if no birthdays */}
          {todaysBirthdays.length === 0 && upcomingBirthdays.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.icon} />
              <ThemedText style={styles.emptyText}>No birthdays yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>Add your first birthday to get started</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Link href="/add-birthday" asChild>
        <Pressable style={styles.fab}>
          {({ pressed }) => (
            <View style={[styles.fabInner, { opacity: pressed ? 0.8 : 1 }]}>
              <Ionicons name="add" size={28} color={colors.card} />
            </View>
          )}
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  daysChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
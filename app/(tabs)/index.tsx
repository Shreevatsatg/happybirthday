import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const { todaysBirthdays, upcomingBirthdays, loading, error } = useBirthdays();
  const { colors } = useTheme();

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft === 0) return colors.error;
    if (daysLeft <= 3) return '#FF6B6B';
    if (daysLeft <= 7) return '#FFA500';
    return '#4CAF50';
  };

  const getCountdownMessage = () => {
    if (todaysBirthdays.length > 0) {
      return `🎉 ${todaysBirthdays.length} birthday${todaysBirthdays.length > 1 ? 's' : ''} today!`;
    }
    if (upcomingBirthdays.length > 0) {
      const next = upcomingBirthdays[0];
      return `Next: ${next.name} in ${next.daysLeft} day${next.daysLeft > 1 ? 's' : ''}`;
    }
    return 'No upcoming birthdays';
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
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <ThemedText style={styles.errorText}>Oops! Something went wrong</ThemedText>
        <ThemedText secondary style={styles.errorSubtext}>{error}</ThemedText>
        <Pressable 
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={() => window.location.reload()}
        >
          <ThemedText style={{ color: colors.card, fontWeight: '600' }}>Retry</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText type="title" style={styles.greeting}>Birthdays</ThemedText>
              <ThemedText secondary style={styles.subtitle}>
                {getCountdownMessage()}
              </ThemedText>
            </View>
            <Pressable>
              <View style={[styles.notificationButton, { backgroundColor: colors.surface }]}>
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                {todaysBirthdays.length > 0 && (
                  <View style={[styles.notificationBadge, { backgroundColor: colors.error }]} />
                )}
              </View>
            </Pressable>
          </View>



          {/* Today's Birthdays */}
          {todaysBirthdays.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="gift" size={20} color={colors.error} />
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Today&apos;s Celebrations
                  </ThemedText>
                </View>
                <View style={[styles.badge, { backgroundColor: `${colors.error}20` }]}>
                  <ThemedText style={[styles.badgeText, { color: colors.error }]}>
                    {todaysBirthdays.length}
                  </ThemedText>
                </View>
              </View>
              
              {todaysBirthdays.map((birthday) => (
                <Pressable key={birthday.id}>
                  {({ pressed }) => (
                    <View style={[
                      styles.todayCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.error,
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }]
                      }
                    ]}>
                      <View style={styles.cardLeft}>
                        <View style={[styles.avatarContainer, { backgroundColor: `${colors.error}20` }]}>
                          {birthday.photo ? (
                            <Image source={{ uri: birthday.photo }} style={styles.avatar} />
                          ) : (
                            <ThemedText style={styles.avatarText}>
                              {birthday.name.charAt(0).toUpperCase()}
                            </ThemedText>
                          )}
                          <View style={[styles.giftBadge, { backgroundColor: colors.error }]}>
                            <Ionicons name="gift" size={12} color="#fff" />
                          </View>
                        </View>
                        <View style={styles.cardInfo}>
                          <ThemedText type="defaultSemiBold" style={styles.name}>
                            {birthday.name}
                          </ThemedText>
                          <ThemedText secondary style={styles.todaySubtitle}>
                            🎂 Turning {birthday.age} today
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.actionButtons}>
                        <Pressable style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]}>
                          <Ionicons name="chatbubble" size={18} color={colors.error} />
                        </Pressable>
                        <Pressable style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]}>
                          <Ionicons name="call" size={18} color={colors.error} />
                        </Pressable>
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* Upcoming Birthdays */}
          {upcomingBirthdays.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="calendar-outline" size={20} color={colors.tint} />
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Coming Up
                  </ThemedText>
                </View>
                <Pressable>
                  <ThemedText style={[styles.seeAllText, { color: colors.tint }]}>
                    See All
                  </ThemedText>
                </Pressable>
              </View>
              
              {upcomingBirthdays.slice(0, 7).map((birthday) => (
                <Pressable key={birthday.id}>
                  {({ pressed }) => (
                    <View style={[
                      styles.card,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1
                      }
                    ]}>
                      <View style={styles.cardLeft}>
                        <View style={[styles.dateCircle, { backgroundColor: colors.border }]}>
                          <ThemedText style={styles.dateMonth}>
                            {birthday.date.split(' ')[0].slice(0, 3)}
                          </ThemedText>
                          <ThemedText type="defaultSemiBold" style={styles.dateDay}>
                            {birthday.date.split(' ')[1]}
                          </ThemedText>
                        </View>
                        <View style={styles.cardInfo}>
                          <ThemedText type="defaultSemiBold" style={styles.name}>
                            {birthday.name}
                          </ThemedText>
                          <View style={styles.detailsRow}>
                            <ThemedText secondary style={styles.cardSubtitle}>
                              {birthday.date}
                            </ThemedText>
                            {birthday.category && (
                              <>
                                <View style={styles.dot} />
                                <ThemedText secondary style={styles.category}>
                                  {birthday.category}
                                </ThemedText>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                      <View style={[
                        styles.daysChip,
                        { backgroundColor: `${getUrgencyColor(birthday.daysLeft)}20` }
                      ]}>
                        <Ionicons 
                          name="time-outline" 
                          size={14} 
                          color={getUrgencyColor(birthday.daysLeft)} 
                        />
                        <ThemedText style={[
                          styles.daysText,
                          { color: getUrgencyColor(birthday.daysLeft) }
                        ]}>
                          {birthday.daysLeft}d
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* Recent Activity / Missed Birthdays */}
          {/* You can add this section based on your data structure */}

          {/* Empty state */}
          {todaysBirthdays.length === 0 && upcomingBirthdays.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name="calendar-outline" size={64} color={colors.icon} />
              </View>
              <ThemedText type="subtitle" style={styles.emptyText}>
                No birthdays yet
              </ThemedText>
              <ThemedText secondary style={styles.emptySubtext}>
                Start adding birthdays to never forget special days
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Link href="/add-birthday" asChild>
        <Pressable style={styles.fab}>
          {({ pressed }) => (
            <View style={[
              styles.fabInner,
              { 
                backgroundColor: colors.tint,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }]
              }
            ]}>
              <Ionicons name="add" size={28} color={colors.background} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
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
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
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
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  giftBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
  todaySubtitle: {
    fontSize: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardSubtitle: {
    fontSize: 13,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#999',
  },
  category: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  daysText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
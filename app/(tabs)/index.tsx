import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';

import { useCallback, useState } from 'react';

const groups = ['all', 'family', 'friend', 'work', 'other'];

export default function HomeScreen() {
  const { todaysBirthdays, upcomingBirthdays, loading, error, refetch } = useBirthdays();
  const { colors } = useTheme();
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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

  const filteredBirthdays = upcomingBirthdays.filter(b => selectedGroup === 'all' || b.group === selectedGroup);

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
          onPress={() => refetch()}
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

          {/* Today's Birthdays */}
          {todaysBirthdays.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.iconWrapper, { backgroundColor: 'transparent' }]}>
                    <Ionicons name="gift" size={20} color={colors.text} />
                  </View>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Today&apos;s Celebrations
                  </ThemedText>
                </View>
              </View>
              
              {todaysBirthdays.map((birthday) => (
                <Link href={{ pathname: '/birthday-details', params: { id: birthday.id } }} asChild key={birthday.id}>
                  <Pressable>
                    {({ pressed }) => (
                      <View style={[
                        styles.todayCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          opacity: pressed ? 0.7 : 1,
                          transform: [{ scale: pressed ? 0.98 : 1 }]
                        }
                      ]}>
                        <View style={styles.cardLeft}>
                          <View style={[styles.avatarContainer, { backgroundColor: `${colors.error}20` }]}>
                            <ThemedText style={[styles.avatarText, { color: colors.error }]}>
                              {birthday.name.charAt(0).toUpperCase()}
                            </ThemedText>
                          </View>
                          <View style={styles.cardInfo}>
                            <ThemedText type="defaultSemiBold" style={styles.name}>
                              {birthday.name}
                            </ThemedText>
                            <ThemedText secondary style={styles.todaySubtitle}>
                             Turning {birthday.age} today
                            </ThemedText>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.icon} style={{ opacity: 0.4 }} />
                      </View>
                    )}
                  </Pressable>
                </Link>
              ))}
            </View>
          )}

          {/* Upcoming Birthdays */}
          {upcomingBirthdays.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.iconWrapper, { backgroundColor: 'transparent' }]}>
                    <Ionicons name="calendar-outline" size={20} color={colors.tint} />
                  </View>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Coming Up
                  </ThemedText>
                </View>
                
                {/* Expandable Filter Button */}
                <View style={styles.filterWrapper}>
                  <TouchableOpacity 
                    onPress={() => setIsFilterExpanded(!isFilterExpanded)} 
                    style={[
                      styles.filterButton, 
                      { 
                        backgroundColor: 'transparent',
                        borderColor: isFilterExpanded ? colors.tint : 'transparent',
                        borderWidth: 1,
                      }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="filter" size={16} color={colors.tint} />
                    <ThemedText style={[styles.filterText, { color: colors.tint }]}>
                      {selectedGroup.charAt(0).toUpperCase() + selectedGroup.slice(1)}
                    </ThemedText>
                    <Ionicons 
                      name={isFilterExpanded ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color={colors.tint} 
                    />
                  </TouchableOpacity>

                  {/* Expanded Options - Overlay */}
                  {isFilterExpanded && (
                    <View style={[
                      styles.filterDropdown,
                      { 
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      }
                    ]}>
                      {groups.map((g, index) => (
                        <TouchableOpacity
                          key={g}
                          style={[
                            styles.optionItem,
                            index < groups.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                          ]}
                          onPress={() => {
                            setSelectedGroup(g);
                            setIsFilterExpanded(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <ThemedText style={[
                            styles.optionText,
                            { color: selectedGroup === g ? colors.tint : colors.text }
                          ]}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </ThemedText>
                          {selectedGroup === g && (
                            <Ionicons name="checkmark-circle" size={18} color={colors.tint} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              
              {filteredBirthdays.map((birthday) => (
                <Link href={{ pathname: '/birthday-details', params: { id: birthday.id } }} asChild key={birthday.id}>
                  <Pressable>
                    {({ pressed }) => (
                      <View style={[
                        styles.card,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          opacity: pressed ? 0.7 : 1,
                          transform: [{ scale: pressed ? 0.99 : 1 }]
                        }
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
                          <View style={[
                            styles.daysChip,
                            { backgroundColor: `${getUrgencyColor(birthday.daysLeft!)}15` }
                          ]}>
                            <Ionicons 
                              name="time-outline" 
                              size={14} 
                              color={getUrgencyColor(birthday.daysLeft!)} 
                            />
                            <ThemedText style={[
                              styles.daysText,
                              { color: getUrgencyColor(birthday.daysLeft!) }
                            ]}>
                              {birthday.daysLeft}d
                            </ThemedText>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={colors.icon} style={{ opacity: 0.3 }} />
                        </View>
                      </View>
                    )}
                  </Pressable>
                </Link>
              ))}
            </View>
          )}

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
                transform: [{ scale: pressed ? 0.92 : 1 }]
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
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 18,
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
  filterWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 140,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    minWidth: 140,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
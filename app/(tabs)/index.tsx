import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';
import { useFocusEffect } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';

import { useCallback, useState } from 'react';

import { FilterDrawer } from '@/components/ui/filter-drawer';

const groups = ['all', 'family', 'friend', 'work', 'other'];

export default function HomeScreen() {
  const { todaysBirthdays, upcomingBirthdays, loading, error, refetch } = useBirthdays();
  const { colors } = useTheme();
  const router = useRouter();
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

  const handleCall = (phoneNumber: string | null) => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'This contact has no phone number linked.');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleSMS = (phoneNumber: string | null) => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'This contact has no phone number linked.');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`sms:${cleanNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string | null) => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'This contact has no phone number linked.');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanNumber}`).catch(() => {
      Alert.alert('WhatsApp Not Installed', 'WhatsApp is not installed on your device.');
    });
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
              
              {todaysBirthdays.map((birthday) => (
                <View key={birthday.id} style={[styles.todayBirthdayContainer, { backgroundColor: colors.surface,borderColor: colors.border }]}>
                  <Link href={{ pathname: '/birthday-details', params: { id: birthday.id } }} asChild>
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
                            <View style={[styles.avatarContainer, { backgroundColor: `${colors.accent}20` }]}>
                              <ThemedText style={[styles.avatarText, { color: colors.text }]}>
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
                              {birthday.note && (
                                <ThemedText secondary style={styles.notesText}>
                                  {birthday.note}
                                </ThemedText>
                              )}
                            </View>
                          </View>
                        </View>
                      )}
                    </Pressable>
                  </Link>

                  {/* Contact Actions */}
                  <View style={styles.contactActionsRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.text, borderColor: colors.border }]}
                      onPress={() => handleCall((birthday as any).phoneNumber || null)}
                    >
                      <Ionicons name="call" size={20} color={colors.accent} />
                      <ThemedText style={[styles.actionButtonText,{color:colors.background}]}>Call</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.text, borderColor: colors.border }]}
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/ai-assistant',
                          params: {
                            name: birthday.name,
                            note: birthday.note,
                            phoneNumber: (birthday as any).phoneNumber,
                          },
                        })
                      }
                    >
                      <Ionicons name="sparkles" size={20} color={colors.accent} />
                      <ThemedText style={[styles.actionButtonText,{color:colors.background}]}>Wish</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Upcoming Birthdays */}
          {upcomingBirthdays.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Coming Up
                </ThemedText>
                <View style={styles.sectionHeaderRight}>
                  <TouchableOpacity onPress={() => router.push('/search')} style={styles.iconButton}>
                    <Ionicons name="search" size={20} color={colors.text} />
                  </TouchableOpacity>
                  <View style={styles.filterWrapper}>
                    <TouchableOpacity 
                      onPress={() => setIsFilterExpanded(!isFilterExpanded)} 
                      style={styles.iconButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name="filter" 
                        size={20} 
                        color={selectedGroup === 'all' ? colors.text : colors.accent} 
                      />
                    </TouchableOpacity>
                  </View>
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

      <FilterDrawer
        isVisible={isFilterExpanded}
        onClose={() => setIsFilterExpanded(false)}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  todayBirthdayContainer: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  todayCard: {
    flexDirection: 'column',
     marginBottom: 12,
    
  },
  notesText: {
    fontSize: 14,
    marginTop: 8,
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
  },
  });

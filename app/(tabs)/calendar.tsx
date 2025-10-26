import { Ionicons } from '@expo/vector-icons';
import { Link, useNavigation } from 'expo-router';
import { memo, useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, MarkedDates } from 'react-native-calendars';

import { ThemedView } from '@/components/themed-view';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';

// Memoized mini calendar component
const MiniCalendar = memo(({ 
  month, 
  year, 
  monthBirthdays, 
  colors, 
  monthName,
  onMonthPress 
}: any) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const birthdayDays = useMemo(() => {
    const days = new Set<number>();
    monthBirthdays.forEach((b: any) => {
      const bDate = new Date(b.date);
      days.add(bDate.getDate());
    });
    return days;
  }, [monthBirthdays]);

  const renderDays = useMemo(() => {
    const days = [];
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    // Week day headers
    days.push(
      <View key="headers" style={styles.miniWeekRow}>
        {weekDays.map((day, i) => (
          <Text key={i} style={[styles.miniWeekDay, { color: colors.text + '66' }]}>
            {day}
          </Text>
        ))}
      </View>
    );

    // Calendar days
    let dayCount = 1;
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        if ((week === 0 && day < firstDay) || dayCount > daysInMonth) {
          weekDays.push(<View key={`empty-${week}-${day}`} style={styles.miniDay} />);
        } else {
          const currentDay = dayCount;
          const hasBirthday = birthdayDays.has(currentDay);

          weekDays.push(
            <View
              key={`day-${currentDay}`}
              style={[
                styles.miniDay,
                hasBirthday && { backgroundColor: colors.accent, borderRadius: 4 }
              ]}
            >
              <Text
                style={[
                  styles.miniDayText,
                  { color: hasBirthday ? '#FFFFFF' : colors.text },
                  hasBirthday && { fontWeight: '700' }
                ]}
              >
                {currentDay}
              </Text>
            </View>
          );
          dayCount++;
        }
      }
      days.push(
        <View key={`week-${week}`} style={styles.miniWeekRow}>
          {weekDays}
        </View>
      );
      if (dayCount > daysInMonth) break;
    }

    return days;
  }, [month, year, birthdayDays, colors, daysInMonth, firstDay]);

  return (
    <Pressable onPress={onMonthPress}>
      {({ pressed }) => (
        <View 
          style={[
            styles.miniMonth, 
            { 
              backgroundColor: colors.surface,
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }]
            }
          ]}
        >
          <Text style={[styles.miniMonthName, { color: colors.text }]}>
            {monthName}
          </Text>
          <View style={styles.miniCalendar}>
            {renderDays}
          </View>
        </View>
      )}
    </Pressable>
  );
});

MiniCalendar.displayName = 'MiniCalendar';

export default function CalendarScreen() {
  const { birthdays } = useBirthdays();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [currentMonth, setCurrentMonth] = useState(today);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Calendar',
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  // Memoize birthday map for faster lookups
  const birthdayMap = useMemo(() => {
    const map = new Map<string, any[]>();
    birthdays.forEach(birthday => {
      const birthdayDate = new Date(birthday.date);
      const month = birthdayDate.getMonth() + 1;
      const day = birthdayDate.getDate();
      const key = `${month}-${day}`;
      
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(birthday);
    });
    return map;
  }, [birthdays]);

  // Memoize birthdays by month for year view
  const birthdaysByMonth = useMemo(() => {
    const byMonth: any[][] = Array.from({ length: 12 }, () => []);
    birthdays.forEach(birthday => {
      const birthdayDate = new Date(birthday.date);
      byMonth[birthdayDate.getMonth()].push(birthday);
    });
    return byMonth;
  }, [birthdays]);

  const markedDates: MarkedDates = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const marked: MarkedDates = {};

    birthdays.forEach(birthday => {
      const birthdayDate = new Date(birthday.date);
      const month = birthdayDate.getMonth() + 1;
      const day = birthdayDate.getDate();
      const dateString = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const isSelected = dateString === selectedDate;
      const isToday = dateString === todayString;
      
      marked[dateString] = {
        customStyles: {
          container: {
            backgroundColor: isSelected ? colors.background : colors.accent,
            borderRadius: 8,
            borderWidth: isToday ? 2 : 0,
            borderColor: isToday ? colors.accent : 'transparent',
          },
          text: {
            color: isSelected ? colors.text : '#FFFFFF',
            fontWeight: '700',
          },
        },
      };
    });

    // Add selected date if it doesn't have a birthday
    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        customStyles: {
          container: {
            backgroundColor: colors.background,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: colors.text + '40',
          },
          text: {
            color: colors.text,
            fontWeight: '600',
          },
        },
      };
    }

    // Add today's date styling if not already marked
    if (!marked[todayString]) {
      marked[todayString] = {
        customStyles: {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: colors.accent,
            fontWeight: '700',
          },
        },
      };
    } else if (todayString !== selectedDate && marked[todayString]) {
      // If today has a birthday but is not selected, ensure border is shown
      marked[todayString].customStyles.container.borderWidth = 2;
      marked[todayString].customStyles.container.borderColor = colors.accent;
    }

    return marked;
  }, [birthdays, selectedDate, todayString, colors]);

  const getBirthdaysForDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const key = `${month}-${day}`;
    return birthdayMap.get(key) || [];
  };

  const selectedDateBirthdays = useMemo(
    () => getBirthdaysForDate(selectedDate),
    [selectedDate, birthdayMap]
  );
  
  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const renderYearView = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const rows = [];

    for (let row = 0; row < 4; row++) {
      const months = [];
      for (let col = 0; col < 3; col++) {
        const monthIndex = row * 3 + col;
        const monthBirthdays = birthdaysByMonth[monthIndex];
        
        months.push(
          <MiniCalendar
            key={monthIndex}
            month={monthIndex}
            year={currentYear}
            monthBirthdays={monthBirthdays}
            colors={colors}
            monthName={monthNames[monthIndex]}
            onMonthPress={() => {
              const newDate = new Date(currentYear, monthIndex, 1);
              setCurrentMonth(newDate);
              setViewMode('month');
            }}
          />
        );
      }
      rows.push(
        <View key={row} style={styles.monthRow}>
          {months}
        </View>
      );
    }

    return <View style={styles.yearViewContainer}>{rows}</View>;
  }, [birthdaysByMonth, colors, monthNames]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* View Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'month' && { backgroundColor: colors.tint },
              viewMode !== 'month' && { backgroundColor: colors.surface }
            ]}
            onPress={() => setViewMode('month')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="calendar" 
              size={18} 
              color={viewMode === 'month' ? colors.background : colors.text} 
            />
            <Text style={[
              styles.toggleText,
              { color: viewMode === 'month' ? colors.background : colors.text }
            ]}>
              Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'year' && { backgroundColor: colors.tint },
              viewMode !== 'year' && { backgroundColor: colors.surface }
            ]}
            onPress={() => setViewMode('year')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={viewMode === 'year' ? colors.background : colors.text}
            />
            <Text style={[
              styles.toggleText,
              { color: viewMode === 'year' ? colors.background : colors.text }
            ]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'month' ? (
          <>
            <View style={styles.calendarCard}>
              <Calendar
                markingType={'custom'}
                markedDates={markedDates}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                current={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(currentMonth.getDate()).padStart(2, '0')}`}
                onMonthChange={(month) => {
                  setCurrentMonth(new Date(month.year, month.month - 1, 1));
                }}
                theme={{
                  backgroundColor: colors.surface,
                  calendarBackground: colors.surface,
                  textSectionTitleColor: colors.text + '99',
                  selectedDayBackgroundColor: colors.accent,
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: colors.tint,
                  dayTextColor: colors.text,
                  textDisabledColor: colors.border + '66',
                  arrowColor: colors.tint,
                  monthTextColor: colors.text,
                  indicatorColor: colors.tint,
                  textDayFontWeight: '400',
                  textMonthFontWeight: '600',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 15,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 13,
                }}
                style={styles.calendar}
                hideExtraDays={true}
                enableSwipeMonths={true}
              />
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.dateHeaderRow}>
                <Text style={[styles.selectedDateText, { color: colors.text }]}>
                  {selectedDateObj.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                
                <Link href={{ pathname: '/add-birthday', params: { date: selectedDate } }} asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <View 
                        style={[
                          styles.addBirthdayButton,
                          { 
                            backgroundColor: colors.accent,
                            opacity: pressed ? 0.7 : 1,
                            transform: [{ scale: pressed ? 0.95 : 1 }]
                          }
                        ]}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.addBirthdayText}>Add</Text>
                      </View>
                    )}
                  </Pressable>
                </Link>
              </View>

              {selectedDateBirthdays.length > 0 ? (
                <View style={styles.birthdaysContainer}>
                  {selectedDateBirthdays.map((birthday, index) => (
                    <Link href={{ pathname: '/birthday-details', params: { id: birthday.id } }} asChild key={birthday.id || index}>
                      <Pressable>
                        {({ pressed }) => (
                          <View 
                            style={[
                              styles.birthdayCard,
                              { 
                                backgroundColor: colors.surface,
                                borderLeftColor: colors.accent,
                                shadowColor: colors.text,
                                opacity: pressed ? 0.7 : 1,
                                transform: [{ scale: pressed ? 0.98 : 1 }]
                              }
                            ]}
                          >
                            <View style={styles.birthdayIconContainer}>
                              <Text style={styles.birthdayIcon}>🎂</Text>
                            </View>
                            <View style={styles.birthdayInfo}>
                              <Text style={[styles.birthdayName, { color: colors.text }]}>
                                {birthday.name}
                              </Text>
                              <Text style={[styles.birthdayAge, { color: colors.text + '99' }]}>
                                {new Date(birthday.date).getFullYear() && 
                                  `Turning ${new Date().getFullYear() - new Date(birthday.date).getFullYear()} years old`
                                }
                              </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.icon} style={{ opacity: 0.4 }} />
                          </View>
                        )}
                      </Pressable>
                    </Link>
                  ))}
                </View>
              ) : (
                <View style={[styles.noBirthdaysCard, { backgroundColor: colors.background + '40' }]}>
                  <Text style={[styles.noBirthdaysText, { color: colors.text + '66' }]}>
                    No birthdays on this date
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {renderYearView}
            <View style={[styles.yearLegendSection, { backgroundColor: 'transparent' }]}>
              <Ionicons name="information-circle" size={20} color={colors.accent} />
              <Text style={[styles.yearLegendText, { color: colors.text + '99' }]}>
                Dates with {' '}
                <Text style={[styles.yearLegendHighlight, { color: colors.accent }]}>
                  colored background
                </Text>
                {' '} have birthdays
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
    padding: 4,
    backgroundColor: 'transparent',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  calendarCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  calendar: {
    borderRadius: 16,
    paddingBottom: 10,
  },
  detailsSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  addBirthdayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  addBirthdayText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  birthdaysContainer: {
    gap: 12,
  },
  birthdayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  birthdayIconContainer: {
    marginRight: 16,
  },
  birthdayIcon: {
    fontSize: 32,
  },
  birthdayInfo: {
    flex: 1,
  },
  birthdayName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  birthdayAge: {
    fontSize: 14,
  },
  noBirthdaysCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  noBirthdaysText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  legendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    paddingTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  yearViewContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  monthRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  miniMonth: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    position: 'relative',
  },
  miniMonthName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  miniCalendar: {
    gap: 2,
  },
  miniWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  miniWeekDay: {
    fontSize: 9,
    fontWeight: '600',
    width: 14,
    textAlign: 'center',
  },
  miniDay: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniDayText: {
    fontSize: 8,
    textAlign: 'center',
  },
  yearLegendSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 12,
  },
  yearLegendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  yearLegendHighlight: {
    fontWeight: '700',
  },
});
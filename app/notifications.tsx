import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';
import NotificationService, {
  BirthdayGroup,
  NotificationSettings,
  ReminderSchedule,
} from '@/services/notificationservice';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View
} from 'react-native';

const PRESET_TIMES = [
  { label: 'Morning (9:00 AM)', value: 9 },
  { label: 'Afternoon (2:00 PM)', value: 14 },
  { label: 'Evening (6:00 PM)', value: 18 },
  { label: 'Night (8:00 PM)', value: 20 },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [scheduledCount, setScheduledCount] = useState(0);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<BirthdayGroup>('all');
  const { birthdays } = useBirthdays();

  useEffect(() => {
    loadSettings();
    checkPermissionStatus();
    getScheduledNotificationsCount();

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
    });

    return () => subscription.remove();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await NotificationService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const checkPermissionStatus = async () => {
    const status = await NotificationService.getPermissionStatus();
    setPermissionStatus(status);
  };

  const getScheduledNotificationsCount = async () => {
    const notifications = await NotificationService.getAllScheduledNotifications();
    setScheduledCount(notifications.length);
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    await NotificationService.saveSettings(newSettings);

    // Reschedule all notifications with the new settings
    if (birthdays.length > 0) {
      await NotificationService.rescheduleAllNotifications(birthdays);
    }

    await getScheduledNotificationsCount();
  };

  const toggleNotifications = async (value: boolean) => {
    if (!settings) return;

    if (value && permissionStatus !== 'granted') {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Required',
          'To receive birthday reminders, please enable notifications in your device settings.',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      await checkPermissionStatus();
    }

    const newSettings = { ...settings, enabled: value };
    await saveSettings(newSettings);

    if (value) {
      Alert.alert(
        '🎉 Notifications Enabled!',
        'You\'ll receive birthday reminders based on your schedule preferences below.'
      );
    } else {
      Alert.alert(
        'Notifications Disabled',
        'All scheduled birthday reminders have been canceled.',
        [
          { text: 'OK' },
        ]
      );
      await NotificationService.cancelAllNotifications();
      setScheduledCount(0);
    }
  };

  const toggleSound = async (value: boolean) => {
    if (!settings) return;
    const newSettings = { ...settings, soundEnabled: value };
    await saveSettings(newSettings);
  };

  const toggleVibration = async (value: boolean) => {
    if (!settings) return;
    const newSettings = { ...settings, vibrationEnabled: value };
    await saveSettings(newSettings);
  };

  const toggleReminder = async (
    type: keyof ReminderSchedule,
    value: boolean
  ) => {
    if (!settings) return;

    const newGroupReminders = {
      ...settings.groupReminders,
      [selectedGroup]: {
        ...settings.groupReminders[selectedGroup],
        [type]: value,
      },
    };

    const newSettings = {
      ...settings,
      groupReminders: newGroupReminders,
    };
    await saveSettings(newSettings);
  };

  const updateNotificationTime = async (hour: number) => {
    if (!settings) return;
    const newSettings = {
      ...settings,
      notificationTime: hour,
    };
    await saveSettings(newSettings);
    setShowTimeModal(false);
    Alert.alert('Success', `Notification time set to ${hour === 9 ? '9:00 AM' : hour === 14 ? '2:00 PM' : hour === 18 ? '6:00 PM' : '8:00 PM'}`);
  };

  const sendTestNotification = async () => {
    if (permissionStatus !== 'granted') {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications to send test notification.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      await checkPermissionStatus();
    }

    await NotificationService.sendTestNotification();
    Alert.alert(
      '✅ Test Sent!',
      'Check your notification panel to see how birthday reminders will appear.',
      [{ text: 'Got it' }]
    );
  };

  const refreshNotifications = async () => {
    setRefreshing(true);
    await getScheduledNotificationsCount();
    await checkPermissionStatus();
    setRefreshing(false);
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      `This will cancel all ${scheduledCount} scheduled notifications. You can reschedule them by toggling reminders off and on again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await NotificationService.cancelAllNotifications();
            setScheduledCount(0);
            Alert.alert('✓ Cleared', 'All scheduled notifications have been removed.');
          },
        },
      ]
    );
  };

  const openSystemSettings = () => {
    Linking.openSettings();
  };

  const SettingRow = ({ 
    title, 
    subtitle,
    icon,
    iconColor,
    children,
    onPress,
    badge,
    disabled = false
  }: { 
    title: string; 
    subtitle?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    children?: React.ReactNode;
    onPress?: () => void;
    badge?: string;
    disabled?: boolean;
  }) => (
    <Pressable 
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.settingRow, 
        { 
          backgroundColor: colors.surface,
          borderColor:colors.border,
          opacity: disabled ? 0.5 : pressed && onPress ? 0.7 : 1
        }
      ]}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={iconColor || colors.primary} />
        </View>
      )}
      <View style={styles.settingTextContainer}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.settingLabel}>{title}</ThemedText>
          {badge && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.badgeText}>{badge}</ThemedText>
            </View>
          )}
        </View>
        {subtitle && (
          <ThemedText style={[styles.settingSubtitle, { color: colors.icon }]}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {children}
    </Pressable>
  );

  if (loading || !settings) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const getPermissionInfo = () => {
    switch (permissionStatus) {
      case 'granted':
        return {
          color: '#10b981',
          icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
          text: 'Active',
          description: 'All systems ready'
        };
      case 'denied':
        return {
          color: '#ef4444',
          icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
          text: 'Disabled',
          description: 'Enable in settings'
        };
      default:
        return {
          color: '#f59e0b',
          icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
          text: 'Not Set',
          description: 'Tap to enable'
        };
    }
  };

  const permissionInfo = getPermissionInfo();
  const activeReminders = Object.values(settings.groupReminders[selectedGroup] || {}).filter(Boolean).length;

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Master Toggle */}
        <View style={styles.section}>
          <View style={[styles.masterToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.masterToggleContent}>
              <View style={[styles.masterIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="notifications" size={24} color={colors.primary} />
              </View>
              <View style={styles.masterToggleText}>
                <ThemedText style={styles.masterToggleTitle}>Birthday Reminders</ThemedText>
                <ThemedText style={[styles.masterToggleSubtitle, { color: colors.icon }]}>
                  {settings.enabled 
                    ? `On, sending at ${settings.notificationTime || 9}:00` 
                    : 'Off'}
                </ThemedText>
              </View>
              <Switch
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={toggleNotifications}
                value={settings.enabled}
              />
            </View>
            
            <SettingRow 
              title="Notification Time"
              subtitle={`Receive reminders at ${settings.notificationTime || 9}:00 ${(settings.notificationTime || 9) < 12 ? 'AM' : 'PM'}`}
              icon="time-outline"
              onPress={() => setShowTimeModal(true)}
              disabled={!settings.enabled}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </SettingRow>
          </View>
        </View>

        

        {/* Reminder Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Reminder Schedule
            </ThemedText>
            {settings.enabled && (
              <ThemedText style={[styles.sectionBadge, { color: colors.primary }]}>
                {activeReminders} active
              </ThemedText>
            )}
          </View>

          <View style={styles.groupSelector}>
            {(['all', 'friends', 'family', 'work', 'others'] as BirthdayGroup[]).map((group) => (
              <Pressable
                key={group}
                style={[
                  styles.groupTab,
                  selectedGroup === group && { backgroundColor: colors.primary },
                ]}
                onPress={() => setSelectedGroup(group)}
              >
                <ThemedText
                  style={[
                    styles.groupTabText,
                    selectedGroup === group && { color: '#fff' },
                  ]}
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          
          <View style={[styles.card, { backgroundColor: colors.surface,borderColor:colors.border }]}>
            <SettingRow 
              title="On Birthday"
              subtitle="Celebrate the special day"
              icon="gift-outline"
              iconColor="#10b981"
            >
              <Switch
                trackColor={{ false: colors.border, true: '#10b981' }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={(value) => toggleReminder('onBirthday', value)}
                value={settings.groupReminders[selectedGroup]?.onBirthday}
                disabled={!settings.enabled}
              />
            </SettingRow>
            
            <SettingRow 
              title="1 Hour Before"
              subtitle="Last-minute reminder (on birthday)"
              icon="time-outline"
              iconColor="#8b5cf6"
            >
              <Switch
                trackColor={{ false: colors.border, true: '#8b5cf6' }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={(value) => toggleReminder('oneHourBefore', value)}
                value={settings.groupReminders[selectedGroup]?.oneHourBefore}
                disabled={!settings.enabled}
              />
            </SettingRow>
            <SettingRow 
              title="1 Day Before"
              subtitle="Final reminder before the big day"
              icon="today-outline"
              iconColor="#3b82f6"
            >
              <Switch
                trackColor={{ false: colors.border, true: '#3b82f6' }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={(value) => toggleReminder('oneDayBefore', value)}
                value={settings.groupReminders[selectedGroup]?.oneDayBefore}
                disabled={!settings.enabled}
              />
            </SettingRow>
            <SettingRow 
              title="3 Days Before"
              subtitle="Last chance for online orders"
              icon="calendar-outline"
              iconColor="#06b6d4"
            >
              <Switch
                trackColor={{ false: colors.border, true: '#06b6d4' }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={(value) => toggleReminder('threeDaysBefore', value)}
                value={settings.groupReminders[selectedGroup]?.threeDaysBefore}
                disabled={!settings.enabled}
              />
            </SettingRow>
            <SettingRow 
              title="1 Week Before"
              subtitle="Early reminder for preparation"
              icon="calendar-outline"
              iconColor="#f59e0b"
            >
              <Switch
                trackColor={{ false: colors.border, true: '#f59e0b' }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={(value) => toggleReminder('oneWeekBefore', value)}
                value={settings.groupReminders[selectedGroup]?.oneWeekBefore}
                disabled={!settings.enabled}
              />
            </SettingRow>
            
            <SettingRow 
              title="2 Weeks Before"
              subtitle="Perfect for planning gifts"
              icon="calendar-outline"
              iconColor="#ec4899"
            >
              <Switch
                trackColor={{ false: colors.border, true: '#ec4899' }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={(value) => toggleReminder('twoWeeksBefore', value)}
                value={settings.groupReminders[selectedGroup]?.twoWeeksBefore}
                disabled={!settings.enabled}
              />
            </SettingRow>
          </View>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Notification Style
          </ThemedText>
          
          <View style={[styles.card, { backgroundColor: colors.surface,borderColor:colors.border }]}>
            <SettingRow 
              title="Sound"
              subtitle="Play sound with notifications"
              icon="volume-high-outline"
            >
              <Switch
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={toggleSound}
                value={settings.soundEnabled}
                disabled={!settings.enabled}
              />
            </SettingRow>

            <SettingRow 
              title="Vibration"
              subtitle="Vibrate on notification"
              icon="phone-portrait-outline"
            >
              <Switch
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={toggleVibration}
                value={settings.vibrationEnabled}
                disabled={!settings.enabled}
              />
            </SettingRow>
          </View>
        </View>

            {/* System & Debug */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            System & Debug
          </ThemedText>
          <View style={[styles.card, { backgroundColor: colors.surface,borderColor:colors.border }]}>
            <SettingRow 
              title="Test Notification"
              subtitle="Send a sample reminder"
              icon="flask-outline"
              iconColor="#8b5cf6"
              onPress={sendTestNotification}
            />
            <SettingRow 
              title="Refresh Status"
              subtitle="Update permissions and counts"
              icon="refresh-outline"
              iconColor="#3b82f6"
              onPress={refreshNotifications}
            />
            {scheduledCount > 0 && (
              <SettingRow 
                title="Clear All Notifications"
                subtitle={`Cancel all ${scheduledCount} scheduled reminders`}
                icon="trash-outline"
                iconColor="#ef4444"
                onPress={clearAllNotifications}
              />
            )}
            <SettingRow 
              title="System Settings"
              subtitle="Open notification settings for this app"
              icon="settings-outline"
              iconColor="#6b7280"
              onPress={openSystemSettings}
            />
          </View>
        </View>
        {/* Info Card */}
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8 }]}>
          <View style={styles.statColumn}>
            <View style={[styles.statIconContainer, { backgroundColor: permissionInfo.color + '20' }]}>
              <Ionicons name={permissionInfo.icon} size={28} color={permissionInfo.color} />
            </View>
            <ThemedText style={styles.statValue}>{permissionInfo.text}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.icon }]}>
              {permissionInfo.description}
            </ThemedText>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.statColumn}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calendar" size={28} color={colors.primary} />
            </View>
            <ThemedText style={styles.statValue}>{scheduledCount}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.icon }]}>
              Scheduled
            </ThemedText>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.statColumn}>
            <View style={[styles.statIconContainer, { backgroundColor: '#8b5cf6' + '20' }]}>
              <Ionicons name="time" size={28} color="#8b5cf6" />
            </View>
            <ThemedText style={styles.statValue}>{activeReminders}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.icon }]}>
              Active Types
            </ThemedText>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <View style={styles.infoTextContainer}>
            <ThemedText style={styles.infoTitle}>Smart Notifications</ThemedText>
            <ThemedText style={[styles.infoText, { color: colors.icon }]}>
              Notifications are scheduled automatically when you add or edit birthdays. Enable multiple reminder types to never miss important celebrations!
            </ThemedText>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowTimeModal(false)}
        >
          <View 
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Choose Notification Time</ThemedText>
              <Pressable onPress={() => setShowTimeModal(false)}>
                <Ionicons name="close" size={24} color={colors.icon} />
              </Pressable>
            </View>
            
            {PRESET_TIMES.map((time) => (
              <Pressable
                key={time.value}
                onPress={() => updateNotificationTime(time.value)}
                style={({ pressed }) => [
                  styles.timeOption,
                  { 
                    backgroundColor: settings.notificationTime === time.value 
                      ? colors.primary + '20' 
                      : colors.surface,
                    opacity: pressed ? 0.7 : 1
                  }
                ]}
              >
                <Ionicons 
                  name="time-outline" 
                  size={24} 
                  color={settings.notificationTime === time.value ? colors.primary : colors.icon} 
                />
                <ThemedText style={styles.timeOptionText}>{time.label}</ThemedText>
                {settings.notificationTime === time.value && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionBadge: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '100%',
  },
  masterToggle: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  masterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  masterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  masterToggleText: {
    flex: 1,
  },
  masterToggleTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  masterToggleSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  groupSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 14,
    padding: 4,
  },
  groupTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  groupTabText: {
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  timeOptionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
});

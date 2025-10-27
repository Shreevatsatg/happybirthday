import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import NotificationService, { NotificationSettings } from '@/services/notificationservice';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View
} from 'react-native';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    loadSettings();
    checkPermissionStatus();
    getScheduledNotificationsCount();

    // Listen for notification responses
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
  };

  const toggleNotifications = async (value: boolean) => {
    if (!settings) return;

    if (value && permissionStatus !== 'granted') {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      await checkPermissionStatus();
    }

    const newSettings = { ...settings, enabled: value };
    await saveSettings(newSettings);

    if (!value) {
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
    type: 'oneDayBefore' | 'oneWeekBefore' | 'oneHourBefore' | 'onBirthday',
    value: boolean
  ) => {
    if (!settings) return;
    const newSettings = {
      ...settings,
      reminders: {
        ...settings.reminders,
        [type]: value,
      },
    };
    await saveSettings(newSettings);
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
    Alert.alert('Success!', 'Test notification sent! Check your notification panel.');
  };

  const openSystemSettings = () => {
    Linking.openSettings();
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      `Are you sure you want to cancel all ${scheduledCount} scheduled notifications?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await NotificationService.cancelAllNotifications();
            setScheduledCount(0);
            Alert.alert('Success', 'All notifications cleared!');
          },
        },
      ]
    );
  };

  const SettingRow = ({ 
    title, 
    subtitle,
    children 
  }: { 
    title: string; 
    subtitle?: string;
    children: React.ReactNode 
  }) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.settingTextContainer}>
        <ThemedText style={styles.settingLabel}>{title}</ThemedText>
        {subtitle && <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>}
      </View>
      {children}
    </View>
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

  const getPermissionBadge = () => {
    const badgeStyles = [styles.permissionBadge];
    let text = '';
    
    switch (permissionStatus) {
      case 'granted':
        badgeStyles.push({ backgroundColor: '#10b981' });
        text = 'Enabled';
        break;
      case 'denied':
        badgeStyles.push({ backgroundColor: '#ef4444' });
        text = 'Disabled';
        break;
      default:
        badgeStyles.push({ backgroundColor: '#f59e0b' });
        text = 'Not Set';
    }

    return (
      <View style={badgeStyles}>
        <ThemedText style={styles.permissionBadgeText}>{text}</ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Status</ThemedText>
          
          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Ionicons name="notifications-outline" size={24} color={colors.primary} />
                <ThemedText style={styles.statusLabel}>Permission</ThemedText>
                {getPermissionBadge()}
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                <ThemedText style={styles.statusLabel}>Scheduled</ThemedText>
                <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.countBadgeText}>{scheduledCount}</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>General</ThemedText>
          
          <SettingRow 
            title="Remind me"
            subtitle="Receive birthday reminders"
          >
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
              ios_backgroundColor={colors.border}
              onValueChange={toggleNotifications}
              value={settings.enabled}
            />
          </SettingRow>
        </View>

        {/* Reminder Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Reminder Schedule</ThemedText>
          
          <SettingRow 
            title="1 Week Before"
            subtitle="Get notified 7 days in advance"
          >
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
              ios_backgroundColor={colors.border}
              onValueChange={(value) => toggleReminder('oneWeekBefore', value)}
              value={settings.reminders.oneWeekBefore}
              disabled={!settings.enabled}
            />
          </SettingRow>

          <SettingRow 
            title="1 Day Before"
            subtitle="Get notified the day before"
          >
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
              ios_backgroundColor={colors.border}
              onValueChange={(value) => toggleReminder('oneDayBefore', value)}
              value={settings.reminders.oneDayBefore}
              disabled={!settings.enabled}
            />
          </SettingRow>

          <SettingRow 
            title="1 Hour Before"
            subtitle="Get notified one hour in advance"
          >
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
              ios_backgroundColor={colors.border}
              onValueChange={(value) => toggleReminder('oneHourBefore', value)}
              value={settings.reminders.oneHourBefore}
              disabled={!settings.enabled}
            />
          </SettingRow>

          <SettingRow 
            title="On Birthday"
            subtitle="Get notified on the birthday"
          >
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
              ios_backgroundColor={colors.border}
              onValueChange={(value) => toggleReminder('onBirthday', value)}
              value={settings.reminders.onBirthday}
              disabled={!settings.enabled}
            />
          </SettingRow>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Actions</ThemedText>
          
          <Pressable onPress={sendTestNotification}>
            <SettingRow title="Send Test Notification">
              <View style={styles.valueContainer}>
                <Ionicons name="send-outline" size={22} color={colors.primary} />
              </View>
            </SettingRow>
          </Pressable>

          {scheduledCount > 0 && (
            <Pressable onPress={clearAllNotifications}>
              <SettingRow title="Clear All Notifications">
                <View style={styles.valueContainer}>
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </View>
              </SettingRow>
            </Pressable>
          )}

          <Pressable onPress={openSystemSettings}>
            <SettingRow title="System Settings">
              <View style={styles.valueContainer}>
                <Ionicons name="open-outline" size={22} color={colors.icon} />
              </View>
            </SettingRow>
          </Pressable>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color={colors.icon} />
          <ThemedText style={styles.infoText}>
            Notifications will be scheduled automatically when you add or edit birthdays based on your reminder preferences.
          </ThemedText>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  permissionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    opacity: 0.7,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
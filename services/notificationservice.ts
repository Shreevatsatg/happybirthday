import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const SETTINGS_VERSION_KEY = 'notification_settings_version';
const CURRENT_VERSION = 3; // Incremented version for new structure

export type BirthdayGroup = 'all' | 'friends' | 'family' | 'work' | 'others';

export interface ReminderSchedule {
  twoWeeksBefore: boolean;
  oneWeekBefore: boolean;
  threeDaysBefore: boolean;
  oneDayBefore: boolean;
  oneHourBefore: boolean;
  onBirthday: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationTime: number; // Hour of day (0-23)
  groupReminders: Record<BirthdayGroup, ReminderSchedule>;
}

const DEFAULT_REMINDER_SCHEDULE: ReminderSchedule = {
  twoWeeksBefore: false,
  oneWeekBefore: true,
  threeDaysBefore: false,
  oneDayBefore: true,
  oneHourBefore: false,
  onBirthday: true,
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  notificationTime: 9, // 9 AM
  groupReminders: {
    all: { ...DEFAULT_REMINDER_SCHEDULE },
    friends: { ...DEFAULT_REMINDER_SCHEDULE },
    family: { ...DEFAULT_REMINDER_SCHEDULE },
    work: { ...DEFAULT_REMINDER_SCHEDULE },
    others: { ...DEFAULT_REMINDER_SCHEDULE },
  },
};

// Configure notification handler with enhanced settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {
    this.initializeService();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize service and handle migrations
  private async initializeService(): Promise<void> {
    try {
      await this.migrateSettingsIfNeeded();
      // Only setup notification channels, don't require push token
      await this.setupNotificationChannels();
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  // Setup notification channels (Android only)
  private async setupNotificationChannels(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('birthdays', {
          name: 'Birthday Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B9D',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
          description: 'Notifications for upcoming birthdays',
        });
        console.log('Notification channels setup complete');
      }
    } catch (error) {
      console.error('Error setting up notification channels:', error);
    }
  }

  // Migrate old settings to new format
  private async migrateSettingsIfNeeded(): Promise<void> {
    try {
      const versionStr = await AsyncStorage.getItem(SETTINGS_VERSION_KEY);
      const currentVersion = versionStr ? parseInt(versionStr) : 1;

      if (currentVersion < CURRENT_VERSION) {
        console.log(`Migrating settings from v${currentVersion} to v${CURRENT_VERSION}`);
        
        const oldSettingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        const oldSettings = oldSettingsJson ? JSON.parse(oldSettingsJson) : {};

        const migratedSettings: NotificationSettings = {
          ...DEFAULT_SETTINGS,
          enabled: oldSettings.enabled ?? DEFAULT_SETTINGS.enabled,
          soundEnabled: oldSettings.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
          vibrationEnabled: oldSettings.vibrationEnabled ?? DEFAULT_SETTINGS.vibrationEnabled,
          notificationTime: oldSettings.notificationTime ?? DEFAULT_SETTINGS.notificationTime,
          groupReminders: {
            all: oldSettings.reminders ? { ...DEFAULT_REMINDER_SCHEDULE, ...oldSettings.reminders } : DEFAULT_SETTINGS.groupReminders.all,
            friends: oldSettings.reminders ? { ...DEFAULT_REMINDER_SCHEDULE, ...oldSettings.reminders } : DEFAULT_SETTINGS.groupReminders.friends,
            family: oldSettings.reminders ? { ...DEFAULT_REMINDER_SCHEDULE, ...oldSettings.reminders } : DEFAULT_SETTINGS.groupReminders.family,
            work: oldSettings.reminders ? { ...DEFAULT_REMINDER_SCHEDULE, ...oldSettings.reminders } : DEFAULT_SETTINGS.groupReminders.work,
            others: oldSettings.reminders ? { ...DEFAULT_REMINDER_SCHEDULE, ...oldSettings.reminders } : DEFAULT_SETTINGS.groupReminders.others,
          },
        };

        await this.saveSettings(migratedSettings);
        await AsyncStorage.setItem(SETTINGS_VERSION_KEY, CURRENT_VERSION.toString());
        console.log('Settings migration completed');
      }
    } catch (error) {
      console.error('Error migrating settings:', error);
    }
  }

  // Request notification permissions with better error handling
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Push Notifications require a physical device');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Get permission status
  async getPermissionStatus(): Promise<string> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return 'undetermined';
    }
  }

  // Register for push notifications (OPTIONAL - only needed for remote push)
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Setup channels first
      await this.setupNotificationChannels();

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Permission not granted, skipping push token registration');
        return null;
      }

      // Try to get push token, but don't fail if Firebase not configured
      try {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        this.expoPushToken = token;
        console.log('Push token registered:', token);
        return token;
      } catch (tokenError: any) {
        // If Firebase not configured, that's OK - local notifications will still work
        if (tokenError.message?.includes('FirebaseApp')) {
          console.log('Firebase not configured - local notifications will work fine');
          return null;
        }
        throw tokenError;
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Get notification settings with migration support
  async getSettings(): Promise<NotificationSettings> {
    try {
      const json = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      const settings = json ? JSON.parse(json) : DEFAULT_SETTINGS;
      
      // Ensure all fields exist (backward compatibility)
      return {
        ...DEFAULT_SETTINGS,
        ...settings,
        notificationTime: settings.notificationTime ?? DEFAULT_SETTINGS.notificationTime,
        groupReminders: {
          ...DEFAULT_SETTINGS.groupReminders,
          ...settings.groupReminders,
        },
      };
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Save notification settings
  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }

  // Calculate next birthday occurrence
  private getNextBirthday(date: string): Date {
    const birthdayDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    let nextBirthday = new Date(
      today.getFullYear(),
      birthdayDate.getMonth(),
      birthdayDate.getDate(),
      0, 0, 0, 0
    );

    // If birthday has passed this year, schedule for next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return nextBirthday;
  }

  // Get notification content based on type
  private getNotificationContent(
    name: string,
    remindBefore: 'onBirthday' | 'oneHour' | 'oneDay' | 'threeDays' | 'oneWeek' | 'twoWeeks'
  ): { title: string; body: string; emoji: string } {
    const contents = {
      twoWeeks: {
        emoji: '📅',
        title: 'Birthday in 2 Weeks!',
        body: `${name}'s birthday is coming up. Perfect time to plan something special!`,
      },
      oneWeek: {
        emoji: '🎂',
        title: 'Birthday Next Week!',
        body: `${name}'s birthday is in one week. Time to prepare!`,
      },
      threeDays: {
        emoji: '⏰',
        title: 'Birthday in 3 Days!',
        body: `Don't forget! ${name}'s birthday is just 3 days away.`,
      },
      oneDay: {
        emoji: '🎉',
        title: 'Birthday Tomorrow!',
        body: `${name}'s birthday is tomorrow! Have you prepared?`,
      },
      oneHour: {
        emoji: '⏰',
        title: 'Birthday in 1 Hour!',
        body: `${name}'s birthday starts in one hour!`,
      },
      onBirthday: {
        emoji: '🎊',
        title: 'Happy Birthday!',
        body: `Today is ${name}'s special day! 🎈`,
      },
    };

    return contents[remindBefore];
  }

  // Schedule a birthday notification
  async scheduleBirthdayNotification(
    name: string,
    date: string,
    remindBefore: 'onBirthday' | 'oneHour' | 'oneDay' | 'threeDays' | 'oneWeek' | 'twoWeeks',
    notificationTime: number = 9
  ): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      const nextBirthday = this.getNextBirthday(date);
      const today = new Date();

      // Calculate trigger time
      let triggerDate = new Date(nextBirthday);
      triggerDate.setHours(notificationTime, 0, 0, 0);

      // Adjust based on reminder type
      switch (remindBefore) {
        case 'twoWeeks':
          triggerDate.setDate(triggerDate.getDate() - 14);
          break;
        case 'oneWeek':
          triggerDate.setDate(triggerDate.getDate() - 7);
          break;
        case 'threeDays':
          triggerDate.setDate(triggerDate.getDate() - 3);
          break;
        case 'oneDay':
          triggerDate.setDate(triggerDate.getDate() - 1);
          break;
        case 'oneHour':
          // For 1 hour before, use birthday time minus 1 hour
          triggerDate.setHours(triggerDate.getHours() - 1);
          break;
        case 'onBirthday':
          // Keep the calculated time
          break;
      }

      // Don't schedule if the date is in the past
      if (triggerDate <= today) {
        console.log(`Skipping past notification: ${remindBefore} for ${name}`);
        return null;
      }

      const content = this.getNotificationContent(name, remindBefore);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${content.emoji} ${content.title}`,
          body: content.body,
          sound: settings.soundEnabled,
          vibrate: settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
          data: { 
            name, 
            date, 
            type: remindBefore,
            birthdate: date,
            timestamp: Date.now()
          },
          categoryIdentifier: 'birthday',
        },
        trigger: triggerDate,
      });

      const timeStr = triggerDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      
      console.log(`✓ Scheduled ${remindBefore} for ${name} at ${timeStr} (ID: ${notificationId})`);
      return notificationId;
    } catch (error) {
      console.error(`Error scheduling ${remindBefore} notification for ${name}:`, error);
      return null;
    }
  }

  // Schedule all notifications for a birthday based on settings
  async scheduleAllNotificationsForBirthday(
    name: string,
    date: string,
    group: BirthdayGroup = 'all',
    customSettings?: NotificationSettings
  ): Promise<string[]> {
    const currentSettings = customSettings || await this.getSettings();
    
    if (!currentSettings.enabled) {
      console.log('Notifications disabled, skipping scheduling');
      return [];
    }

    const notificationIds: string[] = [];
    const reminders = currentSettings.groupReminders[group] || currentSettings.groupReminders.all;
    const { notificationTime } = currentSettings;

    const scheduleMap = [
      { key: 'twoWeeksBefore', type: 'twoWeeks' as const },
      { key: 'oneWeekBefore', type: 'oneWeek' as const },
      { key: 'threeDaysBefore', type: 'threeDays' as const },
      { key: 'oneDayBefore', type: 'oneDay' as const },
      { key: 'oneHourBefore', type: 'oneHour' as const },
      { key: 'onBirthday', type: 'onBirthday' as const },
    ];

    for (const { key, type } of scheduleMap) {
      if (reminders[key as keyof typeof reminders]) {
        const id = await this.scheduleBirthdayNotification(name, date, type, notificationTime);
        if (id) notificationIds.push(id);
      }
    }

    console.log(`Scheduled ${notificationIds.length} notifications for ${name} in group ${group}`);
    return notificationIds;
  }

  // Reschedule all notifications (useful after settings change)
  async rescheduleAllNotifications(birthdays: { name: string; date: string; group: BirthdayGroup }[]): Promise<void> {
    console.log('Rescheduling all notifications...');
    await this.cancelAllNotifications();
    
    const settings = await this.getSettings();
    if (!settings.enabled) {
      console.log('Notifications disabled, skipping reschedule');
      return;
    }

    let totalScheduled = 0;
    for (const birthday of birthdays) {
      const ids = await this.scheduleAllNotificationsForBirthday(birthday.name, birthday.date, birthday.group, settings);
      totalScheduled += ids.length;
    }
    
    console.log(`Rescheduled ${totalScheduled} notifications for ${birthdays.length} birthdays`);
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications canceled');
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  // Cancel specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Notification ${notificationId} canceled`);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel notifications for specific person
  async cancelNotificationsForPerson(name: string): Promise<void> {
    try {
      const scheduled = await this.getAllScheduledNotifications();
      const toCancel = scheduled.filter(
        (notif) => notif.content.data?.name === name
      );

      for (const notif of toCancel) {
        await this.cancelNotification(notif.identifier);
      }

      console.log(`Canceled ${toCancel.length} notifications for ${name}`);
    } catch (error) {
      console.error('Error canceling notifications for person:', error);
    }
  }

  // Get all scheduled notifications
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Get notifications grouped by person
  async getNotificationsByPerson(): Promise<Record<string, Notifications.NotificationRequest[]>> {
    const notifications = await this.getAllScheduledNotifications();
    const grouped: Record<string, Notifications.NotificationRequest[]> = {};

    for (const notif of notifications) {
      const name = notif.content.data?.name as string;
      if (name) {
        if (!grouped[name]) {
          grouped[name] = [];
        }
        grouped[name].push(notif);
      }
    }

    return grouped;
  }

  // Send immediate test notification with enhanced content
  async sendTestNotification(): Promise<void> {
    try {
      const settings = await this.getSettings();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎉 Test Notification",
          body: 'Birthday reminders are working perfectly! You\'ll receive notifications like this.',
          sound: settings.soundEnabled,
          vibrate: settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
          data: { test: true, timestamp: Date.now() },
          categoryIdentifier: 'birthday',
        },
        trigger: { seconds: 1 },
      });

      console.log('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byPerson: Record<string, number>;
    nextUpcoming: Notifications.NotificationRequest | null;
  }> {
    const notifications = await this.getAllScheduledNotifications();
    const byType: Record<string, number> = {};
    const byPerson: Record<string, number> = {};
    let nextUpcoming: Notifications.NotificationRequest | null = null;
    let earliestTime = Infinity;

    for (const notif of notifications) {
      const type = notif.content.data?.type as string || 'unknown';
      const name = notif.content.data?.name as string || 'unknown';
      
      byType[type] = (byType[type] || 0) + 1;
      byPerson[name] = (byPerson[name] || 0) + 1;

      const trigger = notif.trigger as any;
      if (trigger?.date) {
        const time = new Date(trigger.date).getTime();
        if (time < earliestTime) {
          earliestTime = time;
          nextUpcoming = notif;
        }
      }
    }

    return {
      total: notifications.length,
      byType,
      byPerson,
      nextUpcoming,
    };
  }

  // Clear expired notifications (cleanup utility)
  async clearExpiredNotifications(): Promise<number> {
    const notifications = await this.getAllScheduledNotifications();
    const now = new Date();
    let cleared = 0;

    for (const notif of notifications) {
      const trigger = notif.trigger as any;
      if (trigger?.date && new Date(trigger.date) < now) {
        await this.cancelNotification(notif.identifier);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`Cleared ${cleared} expired notifications`);
    }
    return cleared;
  }

  // Get next upcoming notification
  async getNextUpcomingNotification(): Promise<{
    notification: Notifications.NotificationRequest;
    daysUntil: number;
  } | null> {
    const stats = await this.getNotificationStats();
    if (!stats.nextUpcoming) return null;

    const trigger = stats.nextUpcoming.trigger as any;
    if (!trigger?.date) return null;

    const triggerDate = new Date(trigger.date);
    const now = new Date();
    const diffMs = triggerDate.getTime() - now.getTime();
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      notification: stats.nextUpcoming,
      daysUntil,
    };
  }

  // Update notification for a specific person (when birthday is edited)
  async updateNotificationsForPerson(name: string, newDate: string, newGroup: BirthdayGroup): Promise<string[]> {
    console.log(`Updating notifications for ${name} to new date ${newDate} and group ${newGroup}`);
    await this.cancelNotificationsForPerson(name);
    return await this.scheduleAllNotificationsForBirthday(name, newDate, newGroup);
  }

  // Get push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default NotificationService.getInstance();

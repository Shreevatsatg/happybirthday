import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminders: {
    oneDayBefore: boolean;
    oneWeekBefore: boolean;
    oneHourBefore: boolean;
    onBirthday: boolean;
  };
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  reminders: {
    oneDayBefore: true,
    oneWeekBefore: false,
    oneHourBefore: false,
    onBirthday: true,
  },
};

// Configure notification handler
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

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      alert('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    return true;
  }

  // Get permission status
  async getPermissionStatus(): Promise<string> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Birthday Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    try {
      const json = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return json ? JSON.parse(json) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Save notification settings
  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Schedule a birthday notification
  async scheduleBirthdayNotification(
    name: string,
    date: string,
    remindBefore: 'onBirthday' | 'oneHour' | 'oneDay' | 'oneWeek'
  ): Promise<string | null> {
    try {
      const birthdayDate = new Date(date);
      const today = new Date();
      
      // Calculate next birthday
      let nextBirthday = new Date(
        today.getFullYear(),
        birthdayDate.getMonth(),
        birthdayDate.getDate(),
        9, // 9 AM
        0,
        0
      );

      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }

      // Calculate trigger time based on reminder type
      let triggerDate = new Date(nextBirthday);
      let title = '';
      let body = '';

      switch (remindBefore) {
        case 'oneWeek':
          triggerDate.setDate(triggerDate.getDate() - 7);
          title = '🎂 Birthday in 1 week!';
          body = `${name}'s birthday is coming up in one week!`;
          break;
        case 'oneDay':
          triggerDate.setDate(triggerDate.getDate() - 1);
          title = '🎉 Birthday Tomorrow!';
          body = `Don't forget! ${name}'s birthday is tomorrow!`;
          break;
        case 'oneHour':
          triggerDate.setHours(triggerDate.getHours() - 1);
          title = '⏰ Birthday in 1 hour!';
          body = `${name}'s birthday is in one hour!`;
          break;
        case 'onBirthday':
          title = '🎊 Happy Birthday!';
          body = `Today is ${name}'s birthday! 🎉`;
          break;
      }

      // Don't schedule if the date is in the past
      if (triggerDate < today) {
        console.log('Notification date is in the past, skipping');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { name, date, type: remindBefore },
        },
        trigger: triggerDate,
      });

      console.log(`Scheduled ${remindBefore} notification for ${name} at ${triggerDate}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Schedule all notifications for a birthday based on settings
  async scheduleAllNotificationsForBirthday(
    name: string,
    date: string,
    settings: NotificationSettings
  ): Promise<string[]> {
    if (!settings.enabled) {
      return [];
    }

    const notificationIds: string[] = [];

    if (settings.reminders.oneWeekBefore) {
      const id = await this.scheduleBirthdayNotification(name, date, 'oneWeek');
      if (id) notificationIds.push(id);
    }

    if (settings.reminders.oneDayBefore) {
      const id = await this.scheduleBirthdayNotification(name, date, 'oneDay');
      if (id) notificationIds.push(id);
    }

    if (settings.reminders.oneHourBefore) {
      const id = await this.scheduleBirthdayNotification(name, date, 'oneHour');
      if (id) notificationIds.push(id);
    }

    if (settings.reminders.onBirthday) {
      const id = await this.scheduleBirthdayNotification(name, date, 'onBirthday');
      if (id) notificationIds.push(id);
    }

    return notificationIds;
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Cancel specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Get all scheduled notifications
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Send immediate test notification
  async sendTestNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎉 Test Notification",
        body: 'Birthday notifications are working!',
        sound: true,
        data: { test: true },
      },
      trigger: { seconds: 1 },
    });
  }
}

export default NotificationService.getInstance();
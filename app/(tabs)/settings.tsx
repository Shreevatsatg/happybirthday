import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
  };

  const toggleDarkMode = () => {
    setDarkMode(previousState => !previousState);
  };

  const handleManageSubscription = () => {
    Alert.alert('Manage Subscription', 'This will open the subscription management screen.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'You have been logged out.');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Settings</ThemedText>
      <ThemedView surface style={styles.settingGroup}>
        <View style={[styles.setting, { borderBottomColor: colors.border }]}>
          <ThemedText>Enable Notifications</ThemedText>
          <Switch
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
        <View style={[styles.setting, { borderBottomColor: colors.border }]}>
          <ThemedText>Dark Mode</ThemedText>
          <Switch
            onValueChange={toggleDarkMode}
            value={darkMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </ThemedView>

      <ThemedView surface style={[styles.settingGroup, { marginTop: 20 }]}>
        <ThemedText 
          style={[styles.link, { color: colors.primary }]} 
          onPress={handleManageSubscription}>
          Manage Subscription
        </ThemedText>
        <ThemedText 
          style={[styles.link, { color: colors.error }]} 
          onPress={handleLogout}>
          Logout
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingGroup: {
    borderRadius: 12,
    padding: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  link: {
    padding: 12,
    fontWeight: '500',
  },
});

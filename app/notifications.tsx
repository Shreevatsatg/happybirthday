
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View, Linking, Alert } from 'react-native';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const openSystemSettings = () => {
    Linking.openSettings();
  };

  const SettingRow = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
      <ThemedText style={styles.settingLabel}>{title}</ThemedText>
      {children}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title" style={styles.title}>Notifications</ThemedText>
      </View>
      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>General</ThemedText>
          <SettingRow title="Enable Notifications">
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
              ios_backgroundColor={colors.border}
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </SettingRow>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Settings</ThemedText>
          <Pressable onPress={() => Alert.alert('Coming Soon!')}>
            <SettingRow title="Remind Me">
              <View style={styles.valueContainer}>
                <ThemedText style={styles.valueText}>1 day before</ThemedText>
                <Ionicons name="chevron-forward" size={22} color={colors.icon} />
              </View>
            </SettingRow>
          </Pressable>
          <SettingRow title="Enable Sound & Vibration">
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
              ios_backgroundColor={colors.border}
              onValueChange={setSoundEnabled}
              value={soundEnabled}
            />
          </SettingRow>
          <Pressable onPress={openSystemSettings}>
            <SettingRow title="System Permissions">
              <Ionicons name="open-outline" size={22} color={colors.icon} />
            </SettingRow>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  settingLabel: {
    fontSize: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 16,
    color: '#999',
  },
});

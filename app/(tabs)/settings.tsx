import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/services/supabase';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleClearWishes = () => {
    Alert.alert(
      'Clear All Wishes',
      'Are you sure you want to delete all saved wishes? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Wishes cleared') },
      ]
    );
  };

  const SettingRow = ({
    icon,
    title,
    type = 'button',
  }: {
    icon: any;
    title: string;
    type?: 'button';
  }) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border,backgroundColor: colors.surface  }]}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon as any} size={22} color={colors.icon} />
        <ThemedText style={styles.settingLabel}>{title}</ThemedText>
      </View>
      {type === 'button' && <Ionicons name="chevron-forward" size={22} color={colors.icon} />}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* App Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Preferences
          </ThemedText>
          <View style={[styles.card, ]}>
            <Pressable onPress={() => router.push('/appearance')}>
              <SettingRow icon="color-palette-outline" title="Appearance" />
            </Pressable>
            <Pressable onPress={() => router.push('/notifications')}>
              <SettingRow icon="notifications-outline" title="Notifications" />
            </Pressable>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account
          </ThemedText>
          <View style={[styles.card, ]}>
            <Pressable onPress={() => Alert.alert('Coming Soon!')}>
              <SettingRow icon="person-outline" title="Manage Profile" type="button" />
            </Pressable>
            <Pressable onPress={() => router.push('/subscription')}>
              <SettingRow icon="star-outline" title="Subscription" type="button" />
            </Pressable>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data
          </ThemedText>
          <View style={[styles.card,]}>
            <Pressable onPress={handleClearWishes}>
              <View style={[styles.settingRow, { borderBottomWidth: 0, backgroundColor: colors.surface  }]}>
                <View style={styles.settingInfo}>
                  <Ionicons name="trash-outline" size={22} color={colors.error} />
                  <ThemedText style={[styles.settingLabel, { color: colors.error }]}>
                    Clear All Wishes
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Auth Button */}
        <View style={styles.authContainer}>
          {session ? (
            <Pressable
              style={({ pressed }) => [
                styles.authButton,
                { backgroundColor: `${colors.error}20`, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <ThemedText style={[styles.authButtonText, { color: colors.error }]}>
                Logout
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.authButton,
                { backgroundColor: colors.tint, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleLogin}
            >
              <Ionicons name="log-in-outline" size={20} color={colors.card} />
              <ThemedText style={[styles.authButtonText, { color: colors.card }]}>
                Login / Sign Up
              </ThemedText>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomWidth: 1,
    paddingLeft: 16,
    borderRadius: 8,
    marginBottom: 4,

  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  authContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

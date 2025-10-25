import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

export default function Account() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleClearData = async () => {
    try {
      await AsyncStorage.clear();
      alert('Local data cleared successfully!');
    } catch (error) {
      console.error('Failed to clear local data:', error);
      alert('Failed to clear local data.');
    }
  };

  const handleDeleteAccount = async () => {
    // Implement account deletion logic here
    alert('Account deletion is not implemented yet.');
  };

  const SettingRow = ({
    icon,
    title,
    onPress,
    color,
  }: {
    icon: any;
    title: string;
    onPress?: () => void;
    color?: string;
  }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.settingRow,
      { borderBottomColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
    ]}>
      <ThemedText style={[styles.settingLabel, color ? { color } : {}]}>{title}</ThemedText>
      <Ionicons name={icon as any} size={22} color={color || colors.icon} />
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      {user ? (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account Information
          </ThemedText>
          <ThemedView style={styles.card}>
            <SettingRow icon="mail-outline" title={user.email || 'N/A'} />
            <SettingRow
              icon="trash-outline"
              title="Delete Account"
              onPress={handleDeleteAccount}
              color={colors.error}
            />
          </ThemedView>
          <Pressable
            style={({ pressed }) => [
              styles.authButton,
              { backgroundColor: `${colors.error}20`, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={signOut}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <ThemedText style={[styles.authButtonText, { color: colors.error }]}>
              Sign Out
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <ThemedView style={styles.section}>
          <ThemedView style={styles.card}>
            <SettingRow
              icon="log-in-outline"
              title="Login / Sign Up"
              onPress={handleLogin}
            />
          </ThemedView>
          <Pressable
            style={({ pressed }) => [
              styles.authButton,
              { backgroundColor: colors.tint, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={20} color={colors.card} />
            <ThemedText style={[styles.authButtonText, { color: colors.card }]}>
              Clear Local Data
            </ThemedText>
          </Pressable>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

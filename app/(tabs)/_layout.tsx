import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Platform, Pressable } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useBirthdays } from '@/hooks/useBirthdays';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { refetch } = useBirthdays();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: colors.background,
          ...Platform.select({
            ios: {
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 3,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        headerTintColor: colors.text,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          padding: Platform.OS === 'ios' ? 30 : 20,
          height: Platform.OS === 'ios' ? 80 : 60,
          borderTopColor: colors.border,
          ...Platform.select({
            ios: {
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 3,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: '/',
          title: 'Birthdays',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cake.fill" color={color} />,
          headerRight: () => (
            <Pressable onPress={() => user ? refetch() : router.push('/login')} style={{ marginRight: 16 }}>
              <Ionicons name="sync" size={24} color={colors.error} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          href: '/ai-assistant',
          title: 'AI Assistant',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: '/settings',
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}

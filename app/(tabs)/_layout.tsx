import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';

import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Platform, Pressable } from 'react-native';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

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
          headerLeft: () => (
            <Pressable onPress={() => router.push('/settings')} style={{ marginLeft: 20 }}>
              <IconSymbol name="gear" size={30} color={colors.tint} />
            </Pressable>
          ),
          headerRight: () => (
            !user && (
              <Pressable onPress={() => router.push('/login')} style={{ marginRight: 20 }}>
                <IconSymbol name="cloud_upload" size={24} color={colors.tint} />
              </Pressable>
            )
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
        name="calendar"
        options={{
          href: '/calendar',
          title: 'Calendar',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="calendar" color={color} />,
        }}
      />
    </Tabs>
  );
}

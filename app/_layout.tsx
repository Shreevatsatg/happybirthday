import { AuthProvider } from '@/context/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function InitialLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
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
        },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-birthday"
        options={{
          presentation: 'modal',
          title: 'Add Birthday',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          presentation: 'modal',
          title: 'Login',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const { colorScheme } = useTheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <InitialLayout />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

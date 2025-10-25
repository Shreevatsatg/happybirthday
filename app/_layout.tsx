import { AuthProvider } from '@/context/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { ThemeProvider } from '@/context/ThemeContext';
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

function App() {
  const { colorScheme } = useTheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavThemeProvider value={theme}>
      <ThemedView style={{ flex: 1 }}>
        <InitialLayout />
        <StatusBar style="auto" />
      </ThemedView>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  );
}

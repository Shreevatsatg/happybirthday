import { openDatabaseSync } from 'expo-sqlite';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system' | 'forest' | 'ocean' | 'sunset';

interface ThemeContextType {
  colorScheme: 'light' | 'dark' | 'forest' | 'ocean' | 'sunset';
  theme: Theme;
  setColorScheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const db = openDatabaseSync('theme.db');

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useNativeColorScheme();
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const setup = async () => {
      await db.execAsync('CREATE TABLE IF NOT EXISTS theme (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT);');
      const result = await db.getFirstAsync<{ value: Theme }>('SELECT value FROM theme;');
      if (result) {
        setTheme(result.value);
      }
    };
    setup();
  }, []);

  const colorScheme = theme === 'system' ? systemColorScheme ?? 'light' : theme;

  const handleSetTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    await db.execAsync('DELETE FROM theme;');
    await db.runAsync('INSERT INTO theme (value) VALUES (?);', newTheme);
  };

  const contextValue = {
    colorScheme,
    theme,
    setColorScheme: handleSetTheme,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

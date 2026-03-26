import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './src/navigation/AppNavigator';
import { lightTheme, darkTheme } from './src/theme';
import { useThemeStore } from './src/stores/todoStore';
import { ThemeMode } from './src/types';

const THEME_KEY = '@willpower_theme_mode';

function App() {
  const systemColorScheme = useColorScheme();
  const { mode, setMode } = useThemeStore();
  const [isReady, setIsReady] = useState(false);

  // 加载保存的主题设置
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_KEY);
        if (savedMode) {
          setMode(savedMode as ThemeMode);
        }
      } catch (e) {
        console.warn('Failed to load theme:', e);
      }
      setIsReady(true);
    };
    loadTheme();
  }, [setMode]);

  // 保存主题设置
  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(THEME_KEY, mode).catch(e => {
        console.warn('Failed to save theme:', e);
      });
    }
  }, [mode, isReady]);

  const isDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  if (!isReady) {
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]} />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
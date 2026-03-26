import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// 亮色主题配色方案 - 商务专业风格
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1E3A5F',        // 深蓝主色
    primaryContainer: '#D6E4FF',
    secondary: '#4A6FA5',      // 辅助蓝
    secondaryContainer: '#DAE5F5',
    tertiary: '#5C7C99',
    tertiaryContainer: '#DDE8F0',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F7FA',
    background: '#F8FAFC',
    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#001A36',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#001C3A',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#0A1F2D',
    onSurface: '#1A1C1E',
    onSurfaceVariant: '#42474E',
    onBackground: '#1A1C1E',
    onError: '#FFFFFF',
    onErrorContainer: '#410002',
    outline: '#73777F',
    outlineVariant: '#C3C7CF',
    inverseSurface: '#2F3133',
    inverseOnSurface: '#F1F0F4',
    inversePrimary: '#ABC7FF',
    elevation: {
      level0: 'transparent',
      level1: '#F0F4F8',
      level2: '#E4EAF1',
      level3: '#D8E0EA',
      level4: '#D4DCE8',
      level5: '#CCD6E3',
    },
  },
};

// 暗黑主题配色方案
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ABC7FF',
    primaryContainer: '#0F2E54',
    secondary: '#B4C9E8',
    secondaryContainer: '#2E4769',
    tertiary: '#9CB4C9',
    tertiaryContainer: '#3A5067',
    surface: '#121416',
    surfaceVariant: '#1E2124',
    background: '#0A0C0E',
    error: '#FFB4AB',
    errorContainer: '#93000A',
    onPrimary: '#0F2E54',
    onPrimaryContainer: '#D6E4FF',
    onSecondary: '#001C3A',
    onSecondaryContainer: '#DAE5F5',
    onTertiary: '#0A1F2D',
    onTertiaryContainer: '#DDE8F0',
    onSurface: '#E3E2E6',
    onSurfaceVariant: '#C3C7CF',
    onBackground: '#E3E2E6',
    onError: '#690005',
    onErrorContainer: '#FFDAD6',
    outline: '#8D9199',
    outlineVariant: '#42474E',
    inverseSurface: '#E3E2E6',
    inverseOnSurface: '#1A1C1E',
    inversePrimary: '#1E3A5F',
    elevation: {
      level0: 'transparent',
      level1: '#1A1D20',
      level2: '#1E2226',
      level3: '#222629',
      level4: '#24282C',
      level5: '#282C30',
    },
  },
};

// 成就勋章颜色
export const achievementColors: Record<string, string> = {
  streak_7: '#FFD700',   // 金色
  streak_21: '#C0C0C0',  // 银色
  streak_30: '#CD7F32',  // 铜色
  streak_100: '#E5E4E2', // 铂金
};

// 成就勋章名称
export const achievementNames: Record<string, string> = {
  streak_7: '坚持一周',
  streak_21: '习惯养成',
  streak_30: '月度坚持',
  streak_100: '百日达人',
};
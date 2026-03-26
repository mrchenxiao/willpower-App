import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../types';

const STORAGE_KEYS = {
  THEME: '@willpower_theme_mode',
  AI_CONFIG: '@willpower_ai_config',
  LAST_SYNC_DATE: '@willpower_last_sync',
  DAILY_SUMMARY: '@willpower_daily_summary_',
};

// 主题存储
export const ThemeStorage = {
  async get(): Promise<ThemeMode> {
    const mode = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return (mode as ThemeMode) || 'system';
  },

  async set(mode: ThemeMode): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
  },
};

// AI配置预留（未来扩展）
export interface AIConfig {
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
}

export const AIConfigStorage = {
  async get(): Promise<AIConfig> {
    const config = await AsyncStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    return config ? JSON.parse(config) : { enabled: false };
  },

  async set(config: AIConfig): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(config));
  },
};

// 计划同步日期存储
export const SyncStorage = {
  async getLastSync(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_DATE);
  },

  async setLastSync(date: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC_DATE, date);
  },
};

// 每日总结存储（AI功能预留）
export interface DailySummary {
  date: string;
  todoCompleted: number;
  todoTotal: number;
  habitChecked: number;
  habitTotal: number;
  planProgress: number;
  aiSummary?: string;
}

export const SummaryStorage = {
  async get(date: string): Promise<DailySummary | null> {
    const summary = await AsyncStorage.getItem(`${STORAGE_KEYS.DAILY_SUMMARY}${date}`);
    return summary ? JSON.parse(summary) : null;
  },

  async set(date: string, summary: DailySummary): Promise<void> {
    await AsyncStorage.setItem(`${STORAGE_KEYS.DAILY_SUMMARY}${date}`, JSON.stringify(summary));
  },

  async getRange(startDate: string, endDate: string): Promise<DailySummary[]> {
    const keys = await AsyncStorage.getAllKeys();
    const summaryKeys = keys.filter(
      key => key.startsWith(STORAGE_KEYS.DAILY_SUMMARY)
    );
    const summaries = await AsyncStorage.multiGet(summaryKeys);
    return summaries
      .map(([, value]) => value ? JSON.parse(value) : null)
      .filter((s): s is DailySummary => s !== null);
  },
};
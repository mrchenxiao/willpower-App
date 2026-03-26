// 数据模型类型定义

export type Granularity = 'day' | 'week' | 'month' | 'year';

export type TodoSource = 'manual' | 'plan';

export type AchievementType = 'streak_7' | 'streak_21' | 'streak_30' | 'streak_100';

export interface Todo {
  id: string;
  title: string;
  datetime: Date;
  reminderEnabled: boolean;
  reminderTime?: Date;
  reminderMessage?: string;
  isCompleted: boolean;
  completedAt?: Date;
  date: Date;
  source: TodoSource;
  planId?: string;
}

export interface Plan {
  id: string;
  title: string;
  granularity: Granularity;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  lastSyncDate?: Date;
}

export interface Habit {
  id: string;
  title: string;
  cycleDays: number;
  startDate: Date;
  isActive: boolean;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  date: Date;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface Achievement {
  id: string;
  habitId: string;
  type: AchievementType;
  earnedAt: Date;
}

// 主题类型
export type ThemeMode = 'light' | 'dark' | 'system';
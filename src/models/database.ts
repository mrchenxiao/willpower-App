import Realm from 'realm';

// Schema版本号，用于数据库迁移
const SCHEMA_VERSION = 1;

// Todo Schema
export const TodoSchema: Realm.ObjectSchema = {
  name: 'Todo',
  primaryKey: 'id',
  properties: {
    id: 'string',
    title: 'string',
    datetime: 'date',
    reminderEnabled: 'bool',
    reminderTime: 'date?',
    reminderMessage: 'string?',
    isCompleted: 'bool',
    completedAt: 'date?',
    date: 'date',
    source: 'string',
    planId: 'string?',
  },
};

// Plan Schema
export const PlanSchema: Realm.ObjectSchema = {
  name: 'Plan',
  primaryKey: 'id',
  properties: {
    id: 'string',
    title: 'string',
    granularity: 'string',
    startDate: 'date',
    endDate: 'date?',
    isActive: 'bool',
    lastSyncDate: 'date?',
  },
};

// Habit Schema
export const HabitSchema: Realm.ObjectSchema = {
  name: 'Habit',
  primaryKey: 'id',
  properties: {
    id: 'string',
    title: 'string',
    cycleDays: 'int',
    startDate: 'date',
    isActive: 'bool',
  },
};

// HabitRecord Schema
export const HabitRecordSchema: Realm.ObjectSchema = {
  name: 'HabitRecord',
  primaryKey: 'id',
  properties: {
    id: 'string',
    habitId: 'string',
    date: 'date',
    isCompleted: 'bool',
    completedAt: 'date?',
  },
};

// Achievement Schema
export const AchievementSchema: Realm.ObjectSchema = {
  name: 'Achievement',
  primaryKey: 'id',
  properties: {
    id: 'string',
    habitId: 'string',
    type: 'string',
    earnedAt: 'date',
  },
};

// 所有Schema
export const schemas = [
  TodoSchema,
  PlanSchema,
  HabitSchema,
  HabitRecordSchema,
  AchievementSchema,
];

// 数据库配置
let realmInstance: Realm | null = null;

export const getRealm = async (): Promise<Realm> => {
  if (realmInstance && !realmInstance.isClosed) {
    return realmInstance;
  }

  realmInstance = await Realm.open({
    schema: schemas,
    schemaVersion: SCHEMA_VERSION,
    migration: (oldRealm, newRealm) => {
      // 在此处处理数据库迁移
      // if (oldRealm.schemaVersion < 2) { ... }
    },
  });

  return realmInstance;
};

export const closeRealm = () => {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
};
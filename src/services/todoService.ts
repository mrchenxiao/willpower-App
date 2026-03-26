import Realm from 'realm';
import { getRealm } from '../models/database';
import { Todo, Plan, Habit, HabitRecord, Achievement } from '../types';

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Todo 服务
export const TodoService = {
  async create(todo: Omit<Todo, 'id'>): Promise<Todo> {
    const realm = await getRealm();
    let newTodo: Todo;
    realm.write(() => {
      newTodo = realm.create<Todo>('Todo', {
        ...todo,
        id: generateId(),
      });
    });
    return newTodo!;
  },

  async update(id: string, updates: Partial<Todo>): Promise<Todo | null> {
    const realm = await getRealm();
    const todo = realm.objectForPrimaryKey<Todo>('Todo', id);
    if (!todo) return null;
    realm.write(() => {
      Object.assign(todo, updates);
    });
    return todo;
  },

  async delete(id: string): Promise<boolean> {
    const realm = await getRealm();
    const todo = realm.objectForPrimaryKey<Todo>('Todo', id);
    if (!todo) return false;
    realm.write(() => {
      realm.delete(todo);
    });
    return true;
  },

  async getById(id: string): Promise<Todo | null> {
    const realm = await getRealm();
    return realm.objectForPrimaryKey<Todo>('Todo', id);
  },

  async getByDate(date: Date): Promise<Todo[]> {
    const realm = await getRealm();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return realm.objects<Todo>('Todo')
      .filtered('date >= $0 AND date <= $1', startOfDay, endOfDay)
      .sorted('datetime');
  },

  async getIncompleteByDate(date: Date): Promise<Todo[]> {
    const realm = await getRealm();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return realm.objects<Todo>('Todo')
      .filtered('date >= $0 AND date <= $1 AND isCompleted = false', startOfDay, endOfDay)
      .sorted('datetime');
  },

  async markComplete(id: string): Promise<Todo | null> {
    return this.update(id, {
      isCompleted: true,
      completedAt: new Date(),
    });
  },
};

// Plan 服务
export const PlanService = {
  async create(plan: Omit<Plan, 'id'>): Promise<Plan> {
    const realm = await getRealm();
    let newPlan: Plan;
    realm.write(() => {
      newPlan = realm.create<Plan>('Plan', {
        ...plan,
        id: generateId(),
      });
    });
    return newPlan!;
  },

  async update(id: string, updates: Partial<Plan>): Promise<Plan | null> {
    const realm = await getRealm();
    const plan = realm.objectForPrimaryKey<Plan>('Plan', id);
    if (!plan) return null;
    realm.write(() => {
      Object.assign(plan, updates);
    });
    return plan;
  },

  async delete(id: string): Promise<boolean> {
    const realm = await getRealm();
    const plan = realm.objectForPrimaryKey<Plan>('Plan', id);
    if (!plan) return false;
    realm.write(() => {
      // 删除关联的未完成待办
      const relatedTodos = realm.objects<Todo>('Todo').filtered('planId = $0 AND isCompleted = false', id);
      realm.delete(relatedTodos);
      realm.delete(plan);
    });
    return true;
  },

  async getActive(): Promise<Plan[]> {
    const realm = await getRealm();
    return realm.objects<Plan>('Plan').filtered('isActive = true');
  },

  async getAll(): Promise<Plan[]> {
    const realm = await getRealm();
    return realm.objects<Plan>('Plan');
  },
};

// Habit 服务
export const HabitService = {
  async create(habit: Omit<Habit, 'id'>): Promise<Habit> {
    const realm = await getRealm();
    let newHabit: Habit;
    realm.write(() => {
      newHabit = realm.create<Habit>('Habit', {
        ...habit,
        id: generateId(),
      });
    });
    return newHabit!;
  },

  async update(id: string, updates: Partial<Habit>): Promise<Habit | null> {
    const realm = await getRealm();
    const habit = realm.objectForPrimaryKey<Habit>('Habit', id);
    if (!habit) return null;
    realm.write(() => {
      Object.assign(habit, updates);
    });
    return habit;
  },

  async delete(id: string): Promise<boolean> {
    const realm = await getRealm();
    const habit = realm.objectForPrimaryKey<Habit>('Habit', id);
    if (!habit) return false;
    realm.write(() => {
      // 删除相关的打卡记录和成就
      const records = realm.objects<HabitRecord>('HabitRecord').filtered('habitId = $0', id);
      const achievements = realm.objects<Achievement>('Achievement').filtered('habitId = $0', id);
      realm.delete(records);
      realm.delete(achievements);
      realm.delete(habit);
    });
    return true;
  },

  async getActive(): Promise<Habit[]> {
    const realm = await getRealm();
    return realm.objects<Habit>('Habit').filtered('isActive = true');
  },

  async getAll(): Promise<Habit[]> {
    const realm = await getRealm();
    return realm.objects<Habit>('Habit');
  },
};

// HabitRecord 服务
export const HabitRecordService = {
  async create(record: Omit<HabitRecord, 'id'>): Promise<HabitRecord> {
    const realm = await getRealm();
    let newRecord: HabitRecord;
    realm.write(() => {
      newRecord = realm.create<HabitRecord>('HabitRecord', {
        ...record,
        id: generateId(),
      });
    });
    return newRecord!;
  },

  async getByHabitAndDate(habitId: string, date: Date): Promise<HabitRecord | null> {
    const realm = await getRealm();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = realm.objects<HabitRecord>('HabitRecord')
      .filtered('habitId = $0 AND date >= $1 AND date <= $2', habitId, startOfDay, endOfDay);

    return records[0] || null;
  },

  async getByHabit(habitId: string): Promise<HabitRecord[]> {
    const realm = await getRealm();
    return realm.objects<HabitRecord>('HabitRecord')
      .filtered('habitId = $0', habitId)
      .sorted('date', true);
  },

  async markComplete(habitId: string, date: Date): Promise<HabitRecord> {
    const existing = await this.getByHabitAndDate(habitId, date);
    if (existing) {
      const realm = await getRealm();
      realm.write(() => {
        existing.isCompleted = true;
        existing.completedAt = new Date();
      });
      return existing;
    }
    return this.create({
      habitId,
      date,
      isCompleted: true,
      completedAt: new Date(),
    });
  },

  async getStreak(habitId: string): Promise<number> {
    const records = await this.getByHabit(habitId);
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < records.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const hasRecord = records.some(r => {
        const recordDate = new Date(r.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === checkDate.getTime() && r.isCompleted;
      });

      if (hasRecord) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
};

// Achievement 服务
export const AchievementService = {
  async create(achievement: Omit<Achievement, 'id'>): Promise<Achievement> {
    const realm = await getRealm();
    let newAchievement: Achievement;
    realm.write(() => {
      newAchievement = realm.create<Achievement>('Achievement', {
        ...achievement,
        id: generateId(),
      });
    });
    return newAchievement!;
  },

  async getByHabit(habitId: string): Promise<Achievement[]> {
    const realm = await getRealm();
    return realm.objects<Achievement>('Achievement')
      .filtered('habitId = $0', habitId)
      .sorted('earnedAt', true);
  },

  async getAll(): Promise<Achievement[]> {
    const realm = await getRealm();
    return realm.objects<Achievement>('Achievement').sorted('earnedAt', true);
  },

  async checkAndAward(habitId: string, streak: number): Promise<Achievement[]> {
    const achievements: Achievement[] = [];
    const existing = await this.getByHabit(habitId);
    const existingTypes = existing.map(a => a.type);

    const milestones: { type: Achievement['type']; days: number }[] = [
      { type: 'streak_7', days: 7 },
      { type: 'streak_21', days: 21 },
      { type: 'streak_30', days: 30 },
      { type: 'streak_100', days: 100 },
    ];

    for (const milestone of milestones) {
      if (streak >= milestone.days && !existingTypes.includes(milestone.type)) {
        const achievement = await this.create({
          habitId,
          type: milestone.type,
          earnedAt: new Date(),
        });
        achievements.push(achievement);
      }
    }

    return achievements;
  },
};
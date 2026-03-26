import { create } from 'zustand';
import { Todo, Plan, Habit, HabitRecord, Achievement, ThemeMode } from '../types';
import { TodoService, PlanService, HabitService, HabitRecordService, AchievementService } from '../services/todoService';

// Todo Store
interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchTodos: (date: Date) => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id'>) => Promise<Todo>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  error: null,

  fetchTodos: async (date: Date) => {
    set({ loading: true, error: null });
    try {
      const todos = await TodoService.getByDate(date);
      set({ todos: [...todos], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addTodo: async (todo) => {
    const newTodo = await TodoService.create(todo);
    set(state => ({ todos: [...state.todos, newTodo] }));
    return newTodo;
  },

  updateTodo: async (id, updates) => {
    await TodoService.update(id, updates);
    set(state => ({
      todos: state.todos.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  },

  deleteTodo: async (id) => {
    await TodoService.delete(id);
    set(state => ({ todos: state.todos.filter(t => t.id !== id) }));
  },

  toggleComplete: async (id) => {
    const todo = get().todos.find(t => t.id === id);
    if (!todo) return;
    const updates = todo.isCompleted
      ? { isCompleted: false, completedAt: undefined }
      : { isCompleted: true, completedAt: new Date() };
    await TodoService.update(id, updates);
    set(state => ({
      todos: state.todos.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  },
}));

// Plan Store
interface PlanState {
  plans: Plan[];
  activePlans: Plan[];
  loading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  addPlan: (plan: Omit<Plan, 'id'>) => Promise<Plan>;
  updatePlan: (id: string, updates: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  activePlans: [],
  loading: false,
  error: null,

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const plans = await PlanService.getAll();
      const activePlans = plans.filter(p => p.isActive);
      set({ plans: [...plans], activePlans, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addPlan: async (plan) => {
    const newPlan = await PlanService.create(plan);
    set(state => {
      const plans = [...state.plans, newPlan];
      const activePlans = plans.filter(p => p.isActive);
      return { plans, activePlans };
    });
    return newPlan;
  },

  updatePlan: async (id, updates) => {
    await PlanService.update(id, updates);
    set(state => {
      const plans = state.plans.map(p => p.id === id ? { ...p, ...updates } : p);
      const activePlans = plans.filter(p => p.isActive);
      return { plans, activePlans };
    });
  },

  deletePlan: async (id) => {
    await PlanService.delete(id);
    set(state => {
      const plans = state.plans.filter(p => p.id !== id);
      const activePlans = plans.filter(p => p.isActive);
      return { plans, activePlans };
    });
  },

  toggleActive: async (id) => {
    const plan = get().plans.find(p => p.id === id);
    if (!plan) return;
    await PlanService.update(id, { isActive: !plan.isActive });
    set(state => {
      const plans = state.plans.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
      const activePlans = plans.filter(p => p.isActive);
      return { plans, activePlans };
    });
  },
}));

// Habit Store
interface HabitState {
  habits: Habit[];
  activeHabits: Habit[];
  records: HabitRecord[];
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  checkIn: (habitId: string) => Promise<Achievement[]>;
  getRecords: (habitId: string) => Promise<void>;
  getTodayRecords: () => Promise<void>;
  getStreak: (habitId: string) => Promise<number>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  activeHabits: [],
  records: [],
  achievements: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    set({ loading: true, error: null });
    try {
      const habits = await HabitService.getAll();
      const activeHabits = habits.filter(h => h.isActive);
      set({ habits: [...habits], activeHabits, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addHabit: async (habit) => {
    const newHabit = await HabitService.create(habit);
    set(state => {
      const habits = [...state.habits, newHabit];
      const activeHabits = habits.filter(h => h.isActive);
      return { habits, activeHabits };
    });
    return newHabit;
  },

  updateHabit: async (id, updates) => {
    await HabitService.update(id, updates);
    set(state => {
      const habits = state.habits.map(h => h.id === id ? { ...h, ...updates } : h);
      const activeHabits = habits.filter(h => h.isActive);
      return { habits, activeHabits };
    });
  },

  deleteHabit: async (id) => {
    await HabitService.delete(id);
    set(state => {
      const habits = state.habits.filter(h => h.id !== id);
      const activeHabits = habits.filter(h => h.isActive);
      return { habits, activeHabits };
    });
  },

  checkIn: async (habitId) => {
    await HabitRecordService.markComplete(habitId, new Date());
    const streak = await HabitRecordService.getStreak(habitId);
    const newAchievements = await AchievementService.checkAndAward(habitId, streak);
    if (newAchievements.length > 0) {
      set(state => ({ achievements: [...newAchievements, ...state.achievements] }));
    }
    await get().getTodayRecords();
    return newAchievements;
  },

  getRecords: async (habitId) => {
    const records = await HabitRecordService.getByHabit(habitId);
    set({ records: [...records] });
  },

  getTodayRecords: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { activeHabits } = get();
    const allRecords: HabitRecord[] = [];
    for (const habit of activeHabits) {
      const record = await HabitRecordService.getByHabitAndDate(habit.id, today);
      if (record) allRecords.push(record);
    }
    set({ records: allRecords });
  },

  getStreak: async (habitId) => {
    return HabitRecordService.getStreak(habitId);
  },
}));

// Theme Store
interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  setMode: (mode) => set({ mode }),
}));
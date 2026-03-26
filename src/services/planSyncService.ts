import { getRealm } from '../models/database';
import { TodoService, PlanService } from './todoService';
import { Plan, Todo, Granularity } from '../types';
import { generateId } from './todoService';

// 判断计划是否应该在今天同步
const shouldSyncToday = (plan: Plan): boolean => {
  if (!plan.isActive) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(plan.startDate);
  startDate.setHours(0, 0, 0, 0);

  // 如果还没到开始日期，不同步
  if (startDate > today) return false;

  // 如果有结束日期且已过期，不同步
  if (plan.endDate) {
    const endDate = new Date(plan.endDate);
    endDate.setHours(23, 59, 59, 999);
    if (endDate < today) return false;
  }

  // 检查今天是否已经同步过
  if (plan.lastSyncDate) {
    const lastSync = new Date(plan.lastSyncDate);
    lastSync.setHours(0, 0, 0, 0);
    if (lastSync.getTime() === today.getTime()) return false;
  }

  // 根据粒度判断是否应该今天同步
  switch (plan.granularity) {
    case 'day':
      return true;
    case 'week':
      // 每周一开始同步
      return today.getDay() === 1;
    case 'month':
      // 每月1号同步
      return today.getDate() === 1;
    case 'year':
      // 每年1月1日同步
      return today.getMonth() === 0 && today.getDate() === 1;
    default:
      return false;
  }
};

// 同步计划到今日待办
export const syncPlansToToday = async (): Promise<Todo[]> => {
  const plans = await PlanService.getActive();
  const syncedTodos: Todo[] = [];

  for (const plan of plans) {
    if (shouldSyncToday(plan)) {
      // 检查今天是否已有来自该计划的待办
      const today = new Date();
      const existingTodos = await TodoService.getByDate(today);
      const hasExistingPlanTodo = existingTodos.some(
        t => t.planId === plan.id && t.source === 'plan'
      );

      if (!hasExistingPlanTodo) {
        // 创建待办
        const todo = await TodoService.create({
          title: plan.title,
          datetime: new Date(),
          reminderEnabled: false,
          isCompleted: false,
          date: today,
          source: 'plan',
          planId: plan.id,
        });

        syncedTodos.push(todo);

        // 更新计划的最后同步日期
        await PlanService.update(plan.id, { lastSyncDate: today });
      }
    }
  }

  return syncedTodos;
};

// 获取计划下次同步日期
export const getNextSyncDate = (granularity: Granularity): Date => {
  const today = new Date();
  const next = new Date(today);

  switch (granularity) {
    case 'day':
      next.setDate(next.getDate() + 1);
      break;
    case 'week':
      // 下周一
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
      next.setDate(next.getDate() + daysUntilMonday);
      break;
    case 'month':
      // 下月1号
      next.setMonth(next.getMonth() + 1, 1);
      break;
    case 'year':
      // 明年1月1日
      next.setFullYear(next.getFullYear() + 1, 0, 1);
      break;
  }

  return next;
};

// 检查并同步（应用启动时调用）
export const checkAndSyncPlans = async (): Promise<number> => {
  const todos = await syncPlansToToday();
  return todos.length;
};
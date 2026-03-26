import { AIConfigStorage, DailySummary } from './storageService';
import { Todo, Plan, Habit, HabitRecord } from '../types';

// AI服务接口（预留扩展）
interface AIServiceInterface {
  // 是否已配置AI
  isConfigured(): Promise<boolean>;

  // 配置AI
  configure(config: { apiKey?: string; baseUrl?: string }): Promise<void>;

  // 生成提醒话术
  generateReminderMessage(todo: Partial<Todo>): Promise<string>;

  // 生成计划建议
  generatePlanSuggestion(goal: string, duration?: string): Promise<string>;

  // 生成每日总结
  generateDailySummary(
    todos: Todo[],
    habits: Habit[],
    records: HabitRecord[],
    plans: Plan[]
  ): Promise<string>;

  // 分析习惯完成情况
  analyzeHabitProgress(habit: Habit, records: HabitRecord[]): Promise<string>;
}

class AIService implements AIServiceInterface {
  private config: { enabled: boolean; apiKey?: string; baseUrl?: string } = {
    enabled: false,
  };

  async isConfigured(): Promise<boolean> {
    const config = await AIConfigStorage.get();
    this.config = config;
    return config.enabled && !!config.apiKey;
  }

  async configure(config: { apiKey?: string; baseUrl?: string }): Promise<void> {
    this.config = {
      enabled: !!config.apiKey,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    };
    await AIConfigStorage.set(this.config);
  }

  async generateReminderMessage(todo: Partial<Todo>): Promise<string> {
    if (!await this.isConfigured()) {
      // 返回默认提醒话术
      return `您有一个待办事项「${todo.title}」需要处理`;
    }

    // TODO: 调用AI API生成智能提醒话术
    // 示例请求结构:
    // const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.config.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'claude-3-opus-20240229',
    //     messages: [
    //       {
    //         role: 'user',
    //         content: `请为待办事项「${todo.title}」生成一个简短有力、激励人心的提醒话术，不超过50字。`,
    //       },
    //     ],
    //   }),
    // });

    return `您有一个待办事项「${todo.title}」需要处理`;
  }

  async generatePlanSuggestion(goal: string, duration?: string): Promise<string> {
    if (!await this.isConfigured()) {
      return `建议将目标「${goal}」拆解为每日可执行的小任务`;
    }

    // TODO: 调用AI API生成计划建议
    // 示例：建议每周、每月的具体执行计划

    return `建议将目标「${goal}」拆解为每日可执行的小任务`;
  }

  async generateDailySummary(
    todos: Todo[],
    habits: Habit[],
    records: HabitRecord[],
    plans: Plan[]
  ): Promise<string> {
    const completedTodos = todos.filter(t => t.isCompleted).length;
    const totalTodos = todos.length;
    const completedHabits = records.filter(r => r.isCompleted).length;
    const activeHabits = habits.filter(h => h.isActive).length;

    const baseSummary = `今日待办完成${completedTodos}/${totalTodos}，习惯打卡${completedHabits}/${activeHabits}。`;

    if (!await this.isConfigured()) {
      return baseSummary;
    }

    // TODO: 调用AI API生成智能总结
    // 可以分析：
    // 1. 哪些任务经常被拖延
    // 2. 哪些习惯容易中断
    // 3. 计划完成情况
    // 4. 给出改进建议

    return baseSummary;
  }

  async analyzeHabitProgress(habit: Habit, records: HabitRecord[]): Promise<string> {
    if (!await this.isConfigured()) {
      const completed = records.filter(r => r.isCompleted).length;
      const total = records.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return `习惯「${habit.title}」完成率${rate}%`;
    }

    // TODO: 调用AI API分析习惯进度
    // 可以分析：
    // 1. 一周内哪天最容易失败
    // 2. 连续打卡趋势
    // 3. 个性化建议

    return `习惯「${habit.title}」进度良好`;
  }
}

export const aiService = new AIService();

export default aiService;
## Context

本项目是一个全新的React Native移动应用，旨在帮助用户建立自律习惯。第一版采用纯前端架构，数据存储在用户手机本地，无需后端服务。

**技术约束：**
- 使用React Native跨平台框架
- 本地数据持久化，不依赖云服务
- 支持iOS和Android双平台

**目标用户：**
- 希望改善自我管理能力的职场人士
- 有长期目标但缺乏执行力的用户
- 想要养成良好习惯的个人

## Goals / Non-Goals

**Goals:**
- 实现今日待办、长期计划、习惯养成三大核心模块
- 提供稳定的本地数据存储和查询能力
- 支持暗黑模式的专业商务UI风格
- 建立可扩展的架构，为后续AI功能预留接口

**Non-Goals:**
- 第一版不实现用户账号系统和云同步
- 不实现AI智能提醒话术生成
- 不实现社交分享功能
- 不实现付费订阅功能

## Decisions

### 1. 数据持久化方案：Realm

**选择**: Realm Database

**理由:**
- 原生支持React Native，性能优异
- 支持复杂查询，适合历史记录统计场景
- 支持数据模型关系（计划→待办、习惯→打卡记录）
- 零配置，开箱即用

**备选方案:**
- AsyncStorage: 仅支持key-value存储，查询能力弱
- SQLite: 需要额外配置，开发体验不如Realm
- WatermelonDB: 功能强大但学习成本较高

### 2. 导航架构：Bottom Tab Navigation

**选择**: React Navigation + Bottom Tabs

**理由:**
- 三大模块同级，适合底部Tab切换
- 用户熟悉的交互模式
- 官方推荐，社区活跃

**架构:**
```
App
├── TabNavigator (Bottom Tabs)
│   ├── 今日待办 (TodayTodoScreen)
│   ├── 长期计划 (PlanScreen)
│   └── 习惯养成 (HabitScreen)
└── 数据层 (Realm)
```

### 3. UI组件库：React Native Paper

**选择**: React Native Paper

**理由:**
- Material Design风格，商务专业
- 内置暗黑模式支持
- 组件丰富，覆盖常用场景
- 社区活跃，维护良好

**备选方案:**
- NativeBase: 组件多但风格偏活泼
- 自定义组件: 开发成本高

### 4. 数据模型设计

```
Todo {
  id: string
  title: string
  datetime: Date
  reminderEnabled: boolean
  reminderTime: Date?
  reminderMessage: string?  // 预留AI生成字段
  isCompleted: boolean
  completedAt: Date?
  date: Date  // 归属日期
  source: 'manual' | 'plan'  // 来源：手动添加或来自计划
  planId: string?
}

Plan {
  id: string
  title: string
  granularity: 'day' | 'week' | 'month' | 'year'
  startDate: Date
  endDate: Date?
  isActive: boolean
  lastSyncDate: Date?
}

Habit {
  id: string
  title: string
  cycleDays: number  // 最少21天
  startDate: Date
  isActive: boolean
  records: HabitRecord[]  // 打卡记录
}

HabitRecord {
  id: string
  habitId: string
  date: Date
  isCompleted: boolean
  completedAt: Date?
}

Achievement {
  id: string
  habitId: string
  type: 'streak_7' | 'streak_21' | 'streak_30' | 'streak_100'
  earnedAt: Date
}
```

### 5. 状态管理：Zustand

**选择**: Zustand

**理由:**
- 轻量级，学习成本低
- 与React Native配合良好
- 无需Provider包裹，使用简单

**备选方案:**
- Redux Toolkit: 功能强大但对小型项目过于复杂
- MobX: 学习成本较高

## Risks / Trade-offs

- **本地数据丢失风险** → 提示用户定期备份（后续版本支持导出功能）
- **通知权限被拒绝** → 引导用户到系统设置开启，同时提供应用内提醒
- **Realm数据库迁移** → 设计可扩展的Schema版本机制
- **跨平台一致性** → 使用React Native Paper保证UI一致性
## ADDED Requirements

### Requirement: 使用Realm作为本地数据库

系统SHALL使用Realm数据库进行本地数据持久化存储。

#### Scenario: 数据库初始化
- **WHEN** 应用首次启动
- **THEN** 系统创建Realm数据库并初始化数据模型

#### Scenario: 数据库版本迁移
- **WHEN** 应用更新导致数据模型变更
- **THEN** 系统执行数据库迁移保持数据完整性

### Requirement: 待办数据持久化

系统SHALL持久化存储待办事项数据。

#### Scenario: 保存待办
- **WHEN** 用户创建或修改待办
- **THEN** 系统将待办数据存入Realm数据库

#### Scenario: 查询待办
- **WHEN** 应用需要显示待办列表
- **THEN** 系统从Realm数据库查询待办记录

### Requirement: 计划数据持久化

系统SHALL持久化存储长期计划数据。

#### Scenario: 保存计划
- **WHEN** 用户创建或修改计划
- **THEN** 系统将计划数据存入Realm数据库

#### Scenario: 查询活跃计划
- **WHEN** 系统需要同步计划到待办
- **THEN** 系统从Realm数据库查询所有活跃计划

### Requirement: 习惯数据持久化

系统SHALL持久化存储习惯及打卡记录数据。

#### Scenario: 保存习惯
- **WHEN** 用户创建或修改习惯
- **THEN** 系统将习惯数据存入Realm数据库

#### Scenario: 保存打卡记录
- **WHEN** 用户为习惯打卡
- **THEN** 系统将打卡记录存入Realm数据库并关联对应习惯

### Requirement: 成就数据持久化

系统SHALL持久化存储用户获得的成就勋章数据。

#### Scenario: 保存成就
- **WHEN** 用户获得成就勋章
- **THEN** 系统将成就数据存入Realm数据库

### Requirement: 数据导出预留

系统SHALL预留数据导出功能的扩展接口。

#### Scenario: 数据导出接口
- **WHEN** 应用需要导出用户数据
- **THEN** 系统提供JSON格式的数据导出接口
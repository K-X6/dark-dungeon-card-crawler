# Map System Specification

## ADDED Requirements

### MAP-001 Chapter System

游戏 SHALL 分为 3 章：墓穴、深渊、王座之间。每章有独立的敌人池、BOSS 池和视觉风格。

#### Scenario: 迷你模式

- WHEN 选择迷你模式
- THEN 仅包含第 1 章（墓穴），5-7 层

#### Scenario: 短局模式

- WHEN 选择短局模式
- THEN 包含第 1-2 章（墓穴→深渊），8-12 层

#### Scenario: 标准模式

- WHEN 选择标准模式
- THEN 包含全部 3 章（墓穴→深渊→王座），15-20 层

### MAP-002 Map Generation

每章开始时 SHALL 预生成整章地图，所有节点对玩家可见。

#### Scenario: 地图预生成

- WHEN 进入新章节
- THEN 生成该章完整地图，显示所有节点及其类型

#### Scenario: 节点可见性

- WHEN 地图展示
- THEN 所有节点类型（战斗/精英/BOSS/宝箱/商店/休息/事件/诅咒事件）图标可见

### MAP-003 Branching Paths

每层 SHALL 有 2-3 条岔路通向下一层，玩家选择一条前进。

#### Scenario: 选择路线

- WHEN 完成当前节点后进入地图
- THEN 显示 2-3 条可选路线，玩家点击一条前进

#### Scenario: 走过不可回头

- WHEN 玩家已走过某个节点
- THEN 该节点已被标记，不可再次进入

### MAP-004 BOSS Frequency

BOSS 频率 SHALL 按模式不同：迷你模式每 4 层一个 BOSS，短局和标准模式每 3 层一个 BOSS。

#### Scenario: 迷你模式 BOSS

- WHEN 迷你模式到达第 4 层或最后一层
- THEN 该层包含 BOSS 节点

#### Scenario: 短局模式 BOSS

- WHEN 短局模式到达第 3、6、9 层或最后一层
- THEN 该层包含 BOSS 节点

#### Scenario: 标准模式 BOSS

- WHEN 标准模式到达第 3、6、9、12、15、18 层或最后一层
- THEN 该层包含 BOSS 节点

### MAP-005 Chapter Transition

每章结束后 SHALL 进入章节结算转场。

#### Scenario: 章节结算

- WHEN 击败章节最终 BOSS
- THEN 显示章节名称和"已征服"文字，回满血，选遗物，选牌，然后进入下一章地图

#### Scenario: 最终章通关

- WHEN 标准模式击败第 3 章最终 BOSS
- THEN 显示胜利界面，展示完整战绩和分数

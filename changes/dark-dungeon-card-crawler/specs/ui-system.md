# UI System Specification

## ADDED Requirements

### UI-001 Main Menu

主菜单 SHALL 包含"新游戏"和"继续游戏"（有存档时可用）。

#### Scenario: 无存档

- WHEN 首次打开游戏
- THEN "继续游戏"置灰不可点击

#### Scenario: 有存档

- WHEN 存在 localStorage 存档
- THEN "继续游戏"可点击，显示存档信息（职业、模式、当前层数）

### UI-002 Visual Theme

游戏 SHALL 采用暗黑奇幻视觉风格，深色调为主。

#### Scenario: 整体色调

- WHEN 任何界面展示
- THEN 主色调为深色（黑/深灰/暗红/暗金），避免明亮色块

### UI-003 Chapter Visual Variation

每章 SHALL 有不同视觉风格。

#### Scenario: 第 1 章墓穴

- WHEN 游戏处于第 1 章
- THEN 视觉采用灰蓝冷色调

#### Scenario: 第 2 章深渊

- WHEN 游戏处于第 2 章
- THEN 视觉采用紫黑暖色调

#### Scenario: 第 3 章王座之间

- WHEN 游戏处于第 3 章
- THEN 视觉采用金红暗色调

### UI-004 Battle UI

战斗 UI SHALL 包含：玩家 HP/护甲/能量显示、手牌区、敌人区（含意图图标）、结束回合按钮、药水区、遗物区。

#### Scenario: 能量显示

- WHEN 玩家打出卡牌消耗能量
- THEN 能量数字实时更新

#### Scenario: 敌人意图显示

- WHEN 敌人下回合为攻击
- THEN 敌人头顶显示剑图标和伤害数字

#### Scenario: 药水使用

- WHEN 点击药水图标
- THEN 药水效果生效，药水图标消失

### UI-005 Map UI

地图 SHALL 显示节点图标和连线。当前层高亮，可前进的路线可点击。

#### Scenario: 节点类型图标

- WHEN 地图展示
- THEN 每种节点类型使用不同图标区分（战斗=剑、精英=骷髅剑、BOSS=龙头、宝箱=箱子、商店=金币、休息=篝火、事件=?、诅咒事件=紫色?）

#### Scenario: 路线选择

- WHEN 完成当前节点
- THEN 可前进的下一层节点高亮可点击，已走过的节点变灰

### UI-006 Chapter Transition

章节结算 SHALL 展示转场动画和文字。

#### Scenario: BOSS 击败后

- WHEN BOSS 被击败
- THEN 显示章节名 + "已征服"文字，播放转场效果后进入遗物选牌界面

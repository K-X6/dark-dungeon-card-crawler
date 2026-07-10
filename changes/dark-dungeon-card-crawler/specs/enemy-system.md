# Enemy System Specification

## ADDED Requirements

### ENM-001 Enemy Types

游戏 SHALL 包含三种敌人类型：普通敌人、精英敌人、BOSS。

#### Scenario: 普通敌人节点

- WHEN 进入普通战斗节点
- THEN 1-2 个普通敌人，从对应章节的普通敌人池中随机

#### Scenario: 精英敌人节点

- WHEN 进入精英节点
- THEN 1 个精英敌人 + 可能附带 1 个杂兵

#### Scenario: BOSS 节点

- WHEN 进入 BOSS 节点
- THEN 单独 1 个 BOSS

### ENM-002 Intent Cycles

每个敌人 SHALL 有固定的意图循环，循环执行。

#### Scenario: 意图循环

- WHEN 骷髅兵进入战斗
- THEN 按"攻击 → 防御(5) → 攻击"循环执行意图

#### Scenario: 循环回到起点

- WHEN 意图循环执行到最后一个意图后
- THEN 下一回合回到循环的第一个意图

### ENM-003 Difficulty Scaling

简单和普通难度 SHALL 仅有数值缩放。困难难度 SHALL 增加随机 AI 变化/新招式。

#### Scenario: 简单难度

- WHEN 简单难度下遇到骷髅兵
- THEN HP 为 18，攻击伤害为 5

#### Scenario: 普通难度

- WHEN 普通难度下遇到骷髅兵
- THEN HP 为 20，攻击伤害为 6

#### Scenario: 困难难度数值

- WHEN 困难难度下遇到骷髅兵
- THEN HP 为 22，攻击伤害为 7

#### Scenario: 困难难度 AI 变化

- WHEN 困难难度下进入普通战斗
- THEN 随机从该敌人的变化池中抽取一种变化（如增加一次攻击、防御频率提高、新增特殊技能）

### ENM-004 Chapter-Specific Enemy Pools

每章 SHALL 有独立的敌人池。

#### Scenario: 第 1 章敌人

- WHEN 在墓穴章节进入战斗
- THEN 从骷髅兵、巨型蜘蛛、暗影史莱姆中随机选取

#### Scenario: 第 2 章敌人

- WHEN 在深渊章节进入战斗
- THEN 从暗影骑士、邪教徒、幽灵中随机选取

#### Scenario: 第 3 章敌人

- WHEN 在王座之间章节进入战斗
- THEN 从恶魔、巫妖、暗影幼龙中随机选取

### ENM-005 BOSS Selection

每章结束时 SHALL 从该章 BOSS 池中随机抽取，同一局内不重复。

#### Scenario: 第 1 章 BOSS

- WHEN 墓穴章节结束
- THEN 从亡灵法师、巨型蜘蛛女王、墓穴守护者中随机选择一个

#### Scenario: BOSS 不重复

- WHEN 同一章节出现第二个 BOSS
- THEN 排除已出现过的 BOSS，从剩余 BOSS 中随机

### ENM-006 Hard Mode AI Variations

困难难度下，每个敌人在进入战斗时 SHALL 从预定义的变化池中随机获得一种变化。同一局内同一敌人类型可因不同战斗获得不同变化。

每种敌人 SHALL 有 2-3 种变化可选，变化包括但不限于：攻击伤害提升、防御增强、新增特殊技能、死亡时触发效果、意图循环改变等。

#### Scenario: 困难模式随机变化

- WHEN 困难难度下进入普通战斗遇到骷髅兵
- THEN 随机从骷髅兵的变化池（暴怒/亡语/铁壁）中抽取一种并应用

#### Scenario: 变化池示例（骷髅兵）

- WHEN 骷髅兵获得暴怒变化
- THEN 攻击伤害 +50%
- WHEN 骷髅兵获得亡语变化
- THEN 死亡时对玩家造成 5 伤害
- WHEN 骷髅兵获得铁壁变化
- THEN 防御意图额外获得 10 护甲

#### Scenario: 变化不跨战斗持久

- WHEN 击败带有变化的敌人后进入下一场战斗
- THEN 新战斗的敌人重新随机抽取变化，不继承上一场的变化


# Combat System Specification

## ADDED Requirements

### CMB-001 Energy System

每回合玩家拥有一定数量的能量，打出卡牌消耗能量，回合结束时未消耗的能量清零。

- 战士初始能量 SHALL 为 3
- 法师初始能量 SHALL 为 4
- 盗贼初始能量 SHALL 为 2
- 遗物"恶魔之翼"SHALL 使每回合能量 +1
- 药水"能量药水"SHALL 使本回合能量 +2

#### Scenario: 战士回合开始

- WHEN 战士回合开始
- THEN 能量重置为 3（不含遗物加成时）

#### Scenario: 打出卡牌消耗能量

- WHEN 玩家打出费用为 2 的卡牌
- THEN 当前能量减少 2

#### Scenario: 能量不足无法打出

- WHEN 玩家尝试打出费用为 2 的卡牌但当前能量为 1
- THEN 该卡牌不可打出，UI 置灰

#### Scenario: 回合结束能量清零

- WHEN 回合结束
- THEN 剩余能量清零，下回合重新计算

### CMB-002 Card Draw

每回合开始时从抽牌堆抽 3 张牌到手牌。无手牌上限。

#### Scenario: 回合开始抽牌

- WHEN 回合开始
- THEN 从抽牌堆顶部抽 3 张牌加入手牌

#### Scenario: 抽牌堆不足 3 张

- WHEN 抽牌堆不足 3 张
- THEN 先抽完剩余牌，然后将弃牌堆洗入抽牌堆，继续抽至 3 张

#### Scenario: 手牌已有多张

- WHEN 回合开始且手牌中已有未打出的牌
- THEN 先将手牌全部弃入弃牌堆，再抽 3 张新牌

### CMB-003 Starting Hand Mulligan

每场战斗开始时，玩家 SHALL 有一次机会将起始 3 张手牌全部重抽。

#### Scenario: 使用换牌

- WHEN 战斗开始展示起始 3 张手牌后玩家选择换牌
- THEN 3 张牌弃入弃牌堆，重新从抽牌堆抽 3 张

#### Scenario: 接受起手

- WHEN 战斗开始展示起始 3 张手牌后玩家选择接受
- THEN 战斗正式开始，由玩家先手

### CMB-004 Player First Action

每场战斗（包括精英和 BOSS）SHALL 由玩家先行动。

#### Scenario: 战斗开始

- WHEN 战斗进入行动阶段
- THEN 先执行玩家的回合

### CMB-005 Armor System

护甲在回合结束时清零，除非卡牌特别说明。护甲可叠加无上限。

#### Scenario: 叠加护甲

- WHEN 玩家连续打出两张防御牌分别获得 5 护甲和 12 护甲
- THEN 当前护甲为 17

#### Scenario: 护甲吸收伤害

- WHEN 敌人造成 10 伤害且玩家当前护甲为 8
- THEN 护甲减至 0，玩家 HP 减少 2

#### Scenario: 回合结束护甲清零

- WHEN 回合结束
- THEN 所有护甲清零

### CMB-006 Poison Mechanic

中毒层数不减，每回合结束时伤害 = 当前层数。

#### Scenario: 中毒每回合伤害

- WHEN 敌人身上有 8 层中毒且回合结束
- THEN 敌人受到 8 点中毒伤害

#### Scenario: 中毒多层叠加

- WHEN 敌人在已有 5 层中毒时再被施加 4 层中毒
- THEN 中毒层数变为 9

#### Scenario: 中毒不衰减

- WHEN 回合结束后
- THEN 中毒层数保持不变

### CMB-007 Burn Mechanic

灼烧每回合结束时伤害 = 当前层数，然后层数 -2。

#### Scenario: 灼烧伤害并衰减

- WHEN 敌人身上有 5 层灼烧且回合结束
- THEN 敌人受到 5 点灼烧伤害，灼烧层数减为 3

#### Scenario: 灼烧层数不足以减 2

- WHEN 敌人身上有 1 层灼烧且回合结束
- THEN 敌人受到 1 点灼烧伤害，灼烧层数清零

### CMB-008 Status Effects

所有状态效果叠加规则 SHALL 为：同名状态仅刷新持续时间，不叠加效果。

#### Scenario: 虚弱效果

- WHEN 敌人被施加虚弱（伤害 -50%）且其攻击意图为 20 伤害
- THEN 实际造成 10 伤害

#### Scenario: 易伤效果

- WHEN 敌人被施加易伤（受伤 +50%）且受到 20 伤害
- THEN 实际受到 30 伤害

#### Scenario: 脆弱效果

- WHEN 玩家被施加脆弱（护甲减半）且打出获得 10 护甲的牌
- THEN 实际获得 5 护甲

#### Scenario: 眩晕效果

- WHEN 敌人被眩晕
- THEN 该敌人跳过完整一回合（不执行任何意图）

#### Scenario: 同名状态刷新

- WHEN 敌人已有 1 回合虚弱（伤害 -50%），再被施加 2 回合虚弱
- THEN 虚弱效果持续 2 回合（刷新为更长的持续时间），减伤比例不变

### CMB-009 Enemy Intent Display

每个敌人下回合的行动类型和关键数值 SHALL 在战斗 UI 中显示。遗物"时间之眼"SHALL 使玩家额外看到未来第 2 回合的意图。

#### Scenario: 显示攻击意图

- WHEN 骷髅兵的下回合意图为攻击
- THEN UI 显示"攻击 6"（含数值）

#### Scenario: 显示防御意图

- WHEN 骷髅兵的下回合意图为防御
- THEN UI 显示"防御 5"（含护甲值）

#### Scenario: 时间之眼看两回合`n`n- WHEN 持有时间之眼`n- THEN 每个敌人显示当前意图（下回合）和下下回合的意图`n`n#### Scenario: 意图随回合刷新

- WHEN 敌人执行完当前回合行动后
- THEN 显示出下一回合的新意图

### CMB-010 Multi-Enemy Turn Order

同一回合内多个敌人的行动顺序 SHALL 为随机。

#### Scenario: 三敌人战斗

- WHEN 玩家回合结束后有三个敌人需要行动
- THEN 三个敌人按随机顺序依次执行各自的意图

### CMB-011 Target Selection

单目标攻击牌 SHALL 允许玩家自由选择目标。

#### Scenario: 选择攻击目标

- WHEN 玩家打出单目标攻击牌
- THEN 弹出目标选择，玩家可点击任意存活的敌人

#### Scenario: 点击已死亡敌人

- WHEN 已经没有敌人存活
- THEN 战斗胜利（不需要手动选目标）

### CMB-012 Death and Revival

HP 降至 0 时玩家 SHALL 死亡，游戏结束。凤凰羽毛遗物或凤凰药水 SHALL 在死亡时自动触发复活。

#### Scenario: HP=0 无复活

- WHEN 玩家 HP 降至 0 且没有复活道具
- THEN 显示死亡战绩，返回主菜单

#### Scenario: 凤凰羽毛复活

- WHEN 玩家 HP 降至 0 且持有凤凰羽毛
- THEN 凤凰羽毛消耗，HP 回复至最大 HP 的 50%，战斗继续

#### Scenario: 凤凰药水复活

- WHEN 玩家 HP 降至 0 且持有凤凰药水
- THEN 凤凰药水消耗，HP 回复至最大 HP 的 30%，战斗继续

### CMB-013 Exhaust Cards

消耗牌打出后从本场战斗移除，打完 BOSS 后回归牌组。

#### Scenario: 消耗牌打出

- WHEN 玩家打出一张消耗牌
- THEN 该牌进入消耗区（本场不可再用），不进入弃牌堆

#### Scenario: BOSS 后消耗牌回归

- WHEN 击败 BOSS 进入章节结算
- THEN 所有消耗区的牌回归牌组

### CMB-014 Discard Pile Reshuffle

当抽牌堆为空时，弃牌堆 SHALL 洗入抽牌堆。诅咒牌也 SHALL 混入其中。

#### Scenario: 洗牌

- WHEN 抽牌堆为空且需要抽牌
- THEN 弃牌堆随机打乱后全部移入抽牌堆

#### Scenario: 诅咒牌混入

- WHEN 弃牌堆中有诅咒牌且触发洗牌
- THEN 诅咒牌随其他牌一起洗入抽牌堆

### CMB-015 Strength Mechanic

力量（Strength）每点 SHALL 使攻击牌造成的伤害 +1。力量 SHALL 持续整场战斗，可叠加无上限。

#### Scenario: 力量加成伤害

- WHEN 玩家有 3 点力量且打出伤害为 6 的攻击牌
- THEN 实际造成 9 伤害

#### Scenario: 力量叠加

- WHEN 玩家已有 3 点力量且再获得 2 点力量
- THEN 力量变为 5

#### Scenario: 力量持续整场

- WHEN 玩家获得力量
- THEN 除非牌面特别注明"本回合"，该力量 SHALL 持续整场战斗

### CMB-016 Cost Reduction Stacking

所有费用减免效果 SHALL 可叠加。最终费用 = 原始费用 - 所有减免之和，最低为 0。

#### Scenario: 单一减免

- WHEN 持有贤者之石（全部牌费用 -1）且打出一张费用为 3 的牌
- THEN 实际费用为 2

#### Scenario: 多重减免叠加

- WHEN 持有贤者之石（-1）且使用了敏捷药水（本回合 -1）且打出一张费用为 2 的牌
- THEN 实际费用为 0

#### Scenario: 护甲保留卡牌`n`n- WHEN 打出要塞（护甲可保留至下回合）且当前护甲为 15`n- THEN 回合结束时护甲不消失，延续到下回合`n`n#### Scenario: 减免不产生负数

- WHEN 所有减免之和大于等于原始费用
- THEN 实际费用为 0，不会为负数



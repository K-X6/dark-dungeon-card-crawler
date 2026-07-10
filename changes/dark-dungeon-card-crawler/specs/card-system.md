# Card System Specification

## ADDED Requirements

### CRD-001 Card Types

游戏 SHALL 包含四种卡牌类型：攻击（Attack）、防御（Defense）、能力（Ability）、诅咒（Curse）。

#### Scenario: 攻击牌

- WHEN 打出攻击牌
- THEN 对目标敌人造成牌面描述的伤害

#### Scenario: 防御牌

- WHEN 打出防御牌
- THEN 获得牌面描述的护甲

#### Scenario: 能力牌

- WHEN 打出能力牌
- THEN 触发能力效果（持续整场战斗或指定回合数）

#### Scenario: 诅咒牌无法打出

- WHEN 手牌中有诅咒牌
- THEN 该牌不可被打出（置灰不可点击）

### CRD-002 Card Rarity

卡牌 SHALL 分为三种稀有度：普通（白）、稀有（蓝）、传说（金）。

#### Scenario: 普通卡牌获取

- WHEN 普通战斗胜利后选牌
- THEN 三个选项均为普通稀有度

#### Scenario: 稀有卡牌获取

- WHEN 精英怪击败后获得卡牌
- THEN 获得的卡牌为稀有稀有度

#### Scenario: 传说卡牌获取

- WHEN 从 BOSS 奖励或诅咒事件或商店（稀有价格）获取传说卡牌
- THEN 卡牌显示金色边框

### CRD-003 Card Upgrade

每张卡牌 SHALL 最多升级一次。升级 SHALL 为纯数值提升。

#### Scenario: 升级攻击牌

- WHEN 在休息点选择升级一张攻击牌
- THEN 该牌效果数值升级（伤害 +3），卡牌进入"已升级"状态

#### Scenario: 升级防御牌

- WHEN 在休息点选择升级一张防御牌
- THEN 该牌效果数值升级（护甲 +3）

#### Scenario: 升级能力牌

- WHEN 在休息点选择升级一张能力牌
- THEN 该牌效果提升约 50%（如回能量 +1、抽牌 +1 张）

#### Scenario: 已升级牌不可再升级

- WHEN 尝试升级一张已升级的牌
- THEN 操作不可用（UI 对应选项置灰或隐藏）

### CRD-004 Post-Battle Card Selection

普通战斗胜利后，玩家 SHALL 从 3 张普通牌中选 1 张加入牌组。玩家 SHALL 可以选择跳过。

#### Scenario: 战后选牌

- WHEN 普通战斗胜利
- THEN 展示 3 张随机普通卡牌，玩家点选一张或点"跳过"

#### Scenario: 跳过选牌

- WHEN 玩家在选牌界面点击跳过
- THEN 不加入任何卡牌，直接进入地图界面

#### Scenario: 冥想念珠效果

- WHEN 玩家持有冥想念珠遗物且战后选牌
- THEN 展示 4 张牌而非 3 张

### CRD-005 Minimum Deck Size

牌组 SHALL 至少保持 5 张牌。当牌组已有 5 张时，移除牌的操作不可用。

#### Scenario: 牌组满 5 张

- WHEN 牌组数量为 5 且玩家在商店尝试移除牌
- THEN 移除选项置灰不可点击

### CRD-006 Curse Cards

诅咒牌进入手牌后不可打出。回合结束时，若诅咒牌仍在手牌中，SHALL 触发一次负面效果，之后留在手牌中不再触发。

#### Scenario: 诅咒牌触发

- WHEN 回合结束时手牌中有未触发过的诅咒牌"血蚀"
- THEN 玩家 HP 减少 3，诅咒牌标记为"已触发"，留在手牌中

#### Scenario: 已触发诅咒牌不再触发

- WHEN 后续回合结束时该诅咒牌仍在手牌中
- THEN 不再触发负面效果，仅占手牌位

#### Scenario: 诅咒牌进入弃牌堆

- WHEN 回合结束手牌全部弃入弃牌堆
- THEN 已触发和未触发的诅咒牌随其他牌一起进入弃牌堆

#### Scenario: 诅咒牌重新抽回

- WHEN 诅咒牌通过洗牌重新抽回手牌
- THEN 视为新的未触发状态，回合结束时再次触发

### CRD-007 Starting Deck

每个职业 SHALL 有固定的 10 张起始牌组。

#### Scenario: 战士起始牌组

- WHEN 选择战士开始新游戏
- THEN 牌组包含 5 斩击 + 4 格挡 + 1 战吼，共计 10 张

#### Scenario: 法师起始牌组

- WHEN 选择法师开始新游戏
- THEN 牌组包含 3 奥术飞弹 + 4 法力护盾 + 1 奥术智慧 + 2 火焰箭，共计 10 张

#### Scenario: 盗贼起始牌组

- WHEN 选择盗贼开始新游戏
- THEN 牌组包含 4 匕首投掷 + 3 闪避 + 1 毒刃 + 2 暗影步，共计 10 张

### CRD-008 Exhaust Cards

消耗牌打出后进入消耗区而非弃牌堆，在本场战斗不可再使用。

#### Scenario: 消耗牌本场不可再用

- WHEN 消耗牌打出后抽牌堆重新洗牌
- THEN 消耗牌不在洗回的牌中

#### Scenario: BOSS 后恢复

- WHEN 击败 BOSS
- THEN 所有消耗区的牌回归抽牌堆

### CRD-009 BOSS Card Reward Rarity

BOSS 胜利后的 3 选 1 卡牌奖励 SHALL 随机稀有度（普通/稀有/传说混合），无权重限制。

#### Scenario: BOSS 选牌

- WHEN BOSS 被击败且进入选牌阶段
- THEN 展示 3 张随机稀有度的卡牌，玩家可选一张或跳过

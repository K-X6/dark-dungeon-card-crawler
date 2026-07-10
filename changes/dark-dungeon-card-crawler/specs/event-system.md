# Event System Specification

## ADDED Requirements

### EVT-001 Random Events

地图上的事件节点 SHALL 从 12 个随机事件池中随机抽取一个。每局每个事件最多出现一次。

#### Scenario: 进入事件节点

- WHEN 玩家进入事件节点
- THEN 从 12 个事件中随机抽取一个未出现过的事件展示

#### Scenario: 事件选项

- WHEN 事件展示
- THEN 显示 2-3 个选项，玩家选择一个执行

### EVT-002 Shop System

商店 SHALL 以血量换物，无货币系统。

#### Scenario: 商店展示

- WHEN 进入商店节点
- THEN 展示可购买物品和价格（以 HP 计）

| 物品 | HP 花费 |
|------|---------|
| 普通卡牌（3 选 1） | 15 |
| 稀有卡牌 | 30 |
| 药水 | 10 |
| 普通遗物 | 40 |
| 稀有遗物 | 60 |
| 移除一张牌 | 25 |

#### Scenario: 血量不足

- WHEN 尝试购买但 HP 低于价格
- THEN 购买选项置灰不可点击

#### Scenario: 购买成功

- WHEN 支付 HP 购买物品
- THEN HP 减少对应值，物品加入

### EVT-003 Rest Site

休息点 SHALL 提供二选一：回复 30% HP 或升级一张牌。

#### Scenario: 选择回血

- WHEN 在休息点选择回血
- THEN HP 回复最大 HP 的 30%（向上取整）

#### Scenario: 选择升级

- WHEN 在休息点选择升级
- THEN 牌组中未升级的牌全部可选，选择一张升级

#### Scenario: 治疗石效果

- WHEN 持有治疗石且在休息点选择回血
- THEN 额外回复 10 HP

### EVT-004 Curse Event

诅咒事件 SHALL 必定奖励一个稀有遗物，同时将一张随机诅咒牌混入手牌。

#### Scenario: 诅咒事件

- WHEN 进入诅咒事件节点
- THEN 获得一个随机稀有遗物，同时一张随机诅咒牌加入手牌

### EVT-005 Mirror Fight

幻象之间事件中，镜像 SHALL 复制玩家当前 HP 和牌组（不含遗物和药水），从左到右依次打出能打出的牌。

#### Scenario: 选择战斗

- WHEN 在幻象之间选择战斗
- THEN 进入战斗，敌方为玩家的镜像（相同 HP、相同牌组、无遗物无药水）

#### Scenario: 镜像出牌逻辑

- WHEN 镜像回合
- THEN 从左到右依次检查手牌，打出第一张费用足够且能打出的牌

#### Scenario: 战斗胜利

- WHEN 击败镜像
- THEN 获得一张稀有卡牌

#### Scenario: 战斗失败

- WHEN 被镜像击败
- THEN HP 减少 10，回到地图（不死亡）

# Relic and Potion System Specification

## ADDED Requirements

### RLP-001 Relic System

遗物 SHALL 为被动全局生效的道具，获得后在本局内持续生效。

#### Scenario: 护甲遗物

- WHEN 持有铁指环且进入新战斗
- THEN 战斗开始时自动获得 4 护甲

#### Scenario: 能量遗物

- WHEN 持有恶魔之翼
- THEN 每回合能量 +1

#### Scenario: 复活遗物消耗

- WHEN 持有凤凰羽毛且 HP 降至 0
- THEN 触发复活，凤凰羽毛消失

### RLP-002 Relic Rarity

遗物 SHALL 分三级稀有度：普通、稀有、传说。

#### Scenario: 普通遗物获取

- WHEN 精英怪击败后 60% 概率或宝箱房 70% 概率获得普通遗物
- THEN 获得随机普通遗物

#### Scenario: 稀有遗物获取

- WHEN 精英怪击败后 40% 概率、宝箱房 30% 概率、BOSS 胜利、或诅咒事件
- THEN 获得随机稀有遗物

#### Scenario: 传说遗物获取

- WHEN 商店以 60 HP 购买或恶魔契约事件（失去 20% HP）
- THEN 获得随机传说遗物

### RLP-003 Relic No Limit

遗物 SHALL 无持有数量上限。

#### Scenario: 获取第 10 个遗物

- WHEN 玩家已持有 9 个遗物并获得新的遗物
- THEN 遗物数量变为 10，所有遗物效果正常生效

### RLP-004 Potion System`n`n游戏开始时玩家 SHALL 携带 0 瓶药水。`n`n#### Scenario: 起始药水`n`n- WHEN 新游戏开始`n- THEN 药水栏为空（0 瓶）

药水 SHALL 在战斗中一次性使用，不消耗能量。玩家最多携带 3 瓶（轻便背包 +1 后为 4 瓶）。

#### Scenario: 使用药水

- WHEN 战斗中点击药水使用
- THEN 药水效果立即生效，药水消失

#### Scenario: 药水上限

- WHEN 已有 3 瓶药水且获得新药水
- THEN 新药水直接丢弃不加入

### RLP-005 Potion Drop Rate

普通战斗胜利后 SHALL 有 25% 概率掉落随机普通药水。幸运币 SHALL 使概率提升至 40%。

#### Scenario: 战斗掉落药水

- WHEN 普通战斗胜利且 25% 概率触发
- THEN 获得一瓶随机普通药水

#### Scenario: 幸运币效果

- WHEN 持有幸运币（+15% 药水掉落）且战斗胜利
- THEN 药水掉落概率为 40%

### RLP-006 Potion Rarity

药水 SHALL 分三级稀有度：普通、稀有、传说。

#### Scenario: 普通药水获取

- WHEN 普通战斗掉落或宝箱房 40% 概率或商店 10 HP 购买
- THEN 获得随机普通药水

#### Scenario: 稀有药水获取

- WHEN 宝箱房 40% 概率遗物但仍出药水时或复制镜遗物触发
- THEN 可能获得稀有药水

#### Scenario: 传说药水获取

- WHEN 极小概率从特殊渠道获取
- THEN 获得凤凰药水



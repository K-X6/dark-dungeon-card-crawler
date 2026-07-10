# Meta System Specification

## ADDED Requirements

### MTA-001 Mode and Difficulty Selection

主菜单 SHALL 提供模式和难度选择。

#### Scenario: 选择模式

- WHEN 进入选择模式界面
- THEN 展示迷你（5-7 层）、短局（8-12 层）、标准（15-20 层）三个选项

#### Scenario: 选择难度

- WHEN 进入选择难度界面
- THEN 展示简单、普通、困难三个选项，附带难度说明

#### Scenario: 简单难度说明

- WHEN 展示难度选项
- THEN 简单标注为"敌人较弱，适合熟悉游戏"

#### Scenario: 普通难度说明

- WHEN 展示难度选项
- THEN 普通标注为"标准挑战，适度压力"

#### Scenario: 困难难度说明

- WHEN 展示难度选项
- THEN 困难标注为"敌人更强且行为多变，需要灵活应对"

### MTA-002 Class Selection

主菜单 SHALL 提供职业选择，三个职业默认全可用。

#### Scenario: 职业选择界面

- WHEN 进入职业选择
- THEN 展示战士、法师、盗贼三个选项，各附带风味描述

#### Scenario: 战士描述

- WHEN 展示战士选项
- THEN 显示"铁壁与利刃，正面碾碎一切敌人。"

#### Scenario: 法师描述

- WHEN 展示法师选项
- THEN 显示"掌控元素之力，用智慧撕裂深渊。"

#### Scenario: 盗贼描述

- WHEN 展示盗贼选项
- THEN 显示"来自阴影的刺客，毒刃之下没有活口。"

### MTA-003 Score System

通关后 SHALL 计算总分。

#### Scenario: 分数计算

- WHEN 通关成功
- THEN 总分 = (层数×100 + 击杀数×10 + BOSS数×200 + 剩余HP×3 + 遗物数×15 + (30-牌组数)×5) × 模式倍率 × 难度倍率

#### Scenario: 模式倍率

- WHEN 迷你模式
- THEN 倍率为 0.5
- WHEN 短局模式
- THEN 倍率为 1.0
- WHEN 标准模式
- THEN 倍率为 2.0

#### Scenario: 难度倍率

- WHEN 简单难度
- THEN 倍率为 0.7
- WHEN 普通难度
- THEN 倍率为 1.0
- WHEN 困难难度
- THEN 倍率为 1.5

#### Scenario: 牌组精简分

- WHEN 牌组数量为 20
- THEN 精简分为 (30-20)×5 = 50
- WHEN 牌组数量为 30 或以上
- THEN 精简分为 0

### MTA-004 Death Statistics

HP=0 时 SHALL 显示死亡战绩。

#### Scenario: 死亡战绩

- WHEN 玩家死亡
- THEN 显示职业、模式、难度、到达层数、击杀敌人数、击败 BOSS 数、最终牌组数量

### MTA-005 Save System

进入新楼层时 SHALL 自动保存到 localStorage。

#### Scenario: 自动存档

- WHEN 进入新楼层
- THEN 游戏状态保存到 localStorage

#### Scenario: 续玩

- WHEN 从主菜单选择"继续游戏"且有存档
- THEN 恢复存档状态，从存档楼层开始

#### Scenario: 战斗中退出

- WHEN 在战斗中关闭浏览器后重新打开
- THEN 从当前楼层开始（战斗进度丢失）

### MTA-006 Unlock System

各职业首次通关后 SHALL 解锁新卡牌和专属遗物加入全局卡池/遗物池。

#### Scenario: 战士首次通关

- WHEN 战士首次通关
- THEN 裂地斩、钢铁意志加入战士卡池；狂战士护腕加入遗物池

#### Scenario: 法师首次通关

- WHEN 法师首次通关
- THEN 黑洞、冰环加入法师卡池；大法师之杖加入遗物池

#### Scenario: 盗贼首次通关

- WHEN 盗贼首次通关
- THEN 毒雾、要害打击加入盗贼卡池；暗杀者兜帽加入遗物池

#### Scenario: 三职业全通关

- WHEN 三个职业均至少通关一次
- THEN 命运之轮加入遗物池

#### Scenario: 解锁持久化

- WHEN 解锁触发
- THEN 解锁状态保存到 localStorage，后续开局永久可用

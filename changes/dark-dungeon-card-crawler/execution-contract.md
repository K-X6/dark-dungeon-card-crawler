# 执行合同

## Intent Lock

- **变更名称**：dark-dungeon-card-crawler
- **要解决的问题**：需要一个无需安装、浏览器即玩的 Roguelike 卡牌爬塔游戏。暗黑奇幻主题 + 三职业差异化 + 分支路线选择 + 完整构筑深度，纯前端实现，架构预留扩展空间。
- **范围内**：3 职业 × 3 模式 × 3 难度，59 张卡牌，27 个遗物，9 种药水，20 个敌人，12 个随机事件，章节制爬塔，localStorage 存档，局外解锁，分数系统
- **范围外**：后端/多人/联机（后续版本），更多职业/模式/事件，无尽模式，云端同步，复杂动画特效

## Approved Behavior

### 核心需求（59 条 SHALL/MUST，完整清单见 specs/）

**战斗系统 (16 条)**：能量制（3/4/2 按职业）、每回合抽 3 张可换牌、护甲清零（卡牌可豁免）、中毒不减层/灼烧减 2 层、虚弱-50%/易伤+50%/脆弱护甲减半/眩晕跳一回合、敌人意图可见（遗迹可看 2 回合）、多敌随机顺序、玩家先手、力量每点 +1 攻击伤害、费用减免可叠加最低 0、消耗牌 BOSS 后回归、弃牌堆洗入抽牌堆

**卡牌系统 (9 条)**：四类型（攻击/防御/能力/诅咒）、三级稀有度、升级纯数值最多一次、战后 3 选 1 可跳过、普通战斗只出普通牌、最小牌组 5 张、诅咒触发一次后留手牌占位、BOSS 选牌随机稀有度

**地图系统 (5 条)**：三章制（墓穴→深渊→王座）、预生成全图可见、每层 2-3 岔路、迷你每 4 层 BOSS/短局标准每 3 层 BOSS、章节结算转场

**敌人系统 (6 条)**：9 普 + 3 精 + 8 BOSS、意图循环、简单普通数值缩放、困难数值 + 随机 AI 变化（每敌 2-3 种）、章节敌池隔离、BOSS 同局不重复

**遗物药水 (6 条)**：遗物被动全局无上限、药水战斗中 0 费最多 3 瓶、满仓丢弃、起始 0 瓶、战后 25% 掉药水、各节点掉落规则

**事件系统 (5 条)**：12 事件（每局每事件最多一次）、商店以血换物 6 档价格、休息回血/升级二选一、诅咒事件稀有遗物+诅咒牌、镜像复制玩家牌组+HP 机械出牌

**局外系统 (6 条)**：模式×难度选择+说明、三职业默认全可用+风味描述、分数 = (层×100+杀×10+BOSS×200+HP×3+遗物×15+精简分) × 模式倍率 × 难度倍率、死亡战绩、新楼层自动存档、通关解锁卡牌+遗物持久化

**UI 系统 (6 条)**：主菜单（新游戏+继续）、暗黑奇幻深色调、三章 CSS 变量切换、战斗 UI（HP/护甲/能量/手牌/药水/意图）、地图 UI（8 种节点图标+连线+高亮）、章节转场

### 关键场景

1. 主菜单 → 选模式 → 选难度 → 选职业 → 进入第一章地图
2. 点击战斗节点 → 起始 3 手牌（可换）→ 打牌消耗能量 → 结束回合 → 敌人按随机顺序行动 → 新回合 → 战胜利 → 3 选 1 牌（可跳过）→ 回地图
3. 打完第三层 → BOSS 战 → 胜利 → 选遗物+选牌+回血 → 新章节地图
4. 最终 BOSS 击败 → 战绩+分数+解锁（首次）→ 主菜单
5. HP=0 → 死亡战绩 → 主菜单
6. 关闭浏览器 → 重开 → "继续游戏"可点击 → 从存档楼层恢复

### 验收检查

- 每场战斗的状态效果（虚弱/易伤/脆弱/眩晕/中毒/灼烧）行为与 Spec 一致
- 每张卡牌的效果 DSL 被 combat.js 正确解析执行
- 困难模式下每个敌人有随机变化标识且生效
- 存档/读档后 GameState 完全一致
- 三职业起手牌组均为 10 张
- 章节切换时 CSS 变量（data-chapter）更新

## Design Constraints

### 架构约束
- 零框架，原生 HTML+CSS+JS，index.html 唯一入口
- 事件驱动：GameEngine 发射事件，UI 订阅渲染，引擎可脱离 DOM 独立测试
- 数据驱动：cards.js/enemies.js/relics.js/potions.js/events.js 纯数据不含逻辑
- 存档 = GameState JSON，`JSON.stringify` → localStorage

### 接口约束
- GameEngine 导出：`init(class, mode, diff)` / `getState()` / `setState(path, val)` / `emit(event, payload)` / `on(event, fn)` / `off(event, fn)` / `save()` / `load()`
- shared.js 导出：`showPicker(options, {allowSkip, title})` → Promise<number>
- combat.js 导出：`startBattle(enemies)` / `playCard(card, target)` / `endPlayerTurn()` / `executeEffect(effect)` / `triggerHook(hook, ctx)`

### 依赖约束
- JS 加载顺序：`data/*.js → engine/*.js → ui/*.js`
- 引擎层不可引用 UI 层，UI 层不可直接修改 GameState（走 setState）
- 跨批次只通过 GameEngine 事件总线通信

### 数据约束
- 所有效果使用 DSL 声明，38 种类型（23 战斗 + 15 事件）
- 卡牌升级 = 替换 effects 数组，非新建对象
- 困难 AI 变化 = enemies.js 中 hardVariations 数组
- 遗物效果通过 hook 字段 + triggerHook 分发

## Task Batches

### Batch 1: 数据文件
- **目标**：cards.js, enemies.js, relics.js, potions.js, events.js 五大数据文件
- **输入**：设计文档中的卡牌/敌人/遗物/药水/事件表格
- **输出**：5 个 JS 数据文件，每个含完整数据数组 + 导出
- **完成标准**：所有 TDD 测试通过（数据完整性、DSL 格式、字段非空）

### Batch 2: 核心引擎
- **目标**：game-engine.js（事件总线+状态管理+存档+初始化）+ deck.js（牌组管理）
- **输入**：Batch 1 数据文件
- **输出**：GameEngine 单例 + Deck 模块，完整 GameState 初始化和牌组操作
- **完成标准**：init/setState/emit/on/off/save/load 全部测试通过，drawCards/discardHand/shuffleDeck/getCardCost 测试通过

### Batch 3: 战斗引擎
- **目标**：combat.js（伤害/护甲/状态效果/DSL执行器/状态机/敌人AI/难度缩放）+ relic.js（遗物钩子）
- **输入**：Batch 2 GameEngine
- **输出**：完整战斗逻辑 + 10 个遗物钩子 + 敌方 AI
- **完成标准**：所有 DSL 类型、状态效果、意图循环、难度缩放、钩子触发测试通过

### Batch 4: 地图引擎
- **目标**：map.js（地图生成 + 路线逻辑）
- **输入**：Batch 2 GameEngine
- **输出**：按模式/章节生成完整地图的 generateMap 函数
- **完成标准**：三种模式地图生成正确，BOSS 频率符合规则

### Batch 5: UI 基础 + 主菜单
- **目标**：css/main.css + shared.js + menu.js
- **输入**：Batch 2 GameEngine
- **输出**：全局样式（含三章 CSS 变量）+ showPicker 通用组件 + 主菜单流程
- **完成标准**：菜单四步（模式→难度→职业→开始）流程可用，存档检测正常

### Batch 6: 战斗 UI
- **目标**：css/battle.css + battle-ui.js
- **输入**：Batch 3 combat.js, Batch 5 shared.js
- **输出**：完整战斗界面渲染
- **完成标准**：手牌区/敌人区/HP条/意图/药水/选牌全交互通过

### Batch 7: 地图 UI
- **目标**：css/map.css + map-ui.js
- **输入**：Batch 4 map.js, Batch 5 shared.js
- **输出**：完整地图界面渲染
- **完成标准**：节点可视化/路线点击/章节切换正常

### Batch 8: 事件/商店/休息 UI
- **目标**：event-ui.js（事件+商店+休息）
- **输入**：Batch 2 GameEngine, Batch 5 shared.js, Batch 1 events.js
- **输出**：事件渲染 + DSL 效果执行器 + 商店交易 + 休息点
- **完成标准**：12 事件/商店 6 档价格/休息二选一全交互通过

### Batch 9: 章节 + 战绩
- **目标**：chapter-ui.js + result-ui.js
- **输入**：Batch 3 combat.js, Batch 5 shared.js
- **输出**：章节结算转场 + 分数计算 + 战绩展示 + 解锁逻辑
- **完成标准**：章节转场动画/遗物选牌/分数公式/解锁持久化通过

### Batch 10: 入口 + 全流程联调
- **目标**：index.html + 镜像战斗 + 全流程验证
- **输入**：Batch 1-9 全部
- **输出**：可玩的完整游戏
- **完成标准**：标准模式一局完整通关无报错，存档/读档/解锁链完整

## Test Obligations

### 必须先从失败测试开始的行为
- 每个 Task 的第 1-N 步为测试编写步骤，必须先看到测试失败（红色）再写实现
- 效果 DSL 执行器：38 种类型逐一测试
- 状态效果交互：同名刷新、虚弱+易伤同时生效
- 费用减免叠加：多来源同时生效，最低 0
- 诅咒触发一次后抑制
- 存档 JSON 损坏时优雅降级

### 必需的边界情况
- 牌组抽空 → 弃牌堆洗入
- 牌组 = 5 张时移除操作不可用
- 药水满 3 瓶时新药水丢弃
- 所有牌已升级时休息点升级选项置灰
- 能量不足时卡牌置灰不可点击
- HP 不足时商店购买选项置灰
- BOSS 池耗尽时处理（理论不出现，同章 BOSS 数 ≤ 池大小）

### 回归敏感区域
- GameState 序列化/反序列化一致性
- 事件总线内存泄漏（高频事件需验证取消订阅）
- 章节切换时 data-chapter CSS 变量更新
- 困难模式变化不跨战斗持久

## Execution Mode

- **模式**：`Batch Inline`
- **选择理由**：10 个批次有严格依赖链，需逐批实现并验证。每批完成后提交 review gate，确认无误后进入下一批。单批内按 Task 顺序执行，每个 Task 先写测试再写实现。

## Verification Dimensions

| 维度 | 状态 | 发现 |
|------|------|------|
| Completeness | Pending | — |
| Correctness | Pending | — |
| Coherence | Pending | — |

**总体结论**：Pending — 等待用户审批执行合约后开始实施

## Review Gates

- **Batch 1 完成时**：验证所有数据文件格式正确、DSL 类型完整、导出可用
- **Batch 3 完成时**：验证战斗核心（伤害/状态/DSL/状态机/钩子）全绿，这是最大风险点
- **Batch 6 完成时**：验证战斗 UI 可玩，这是第一次可交互的里程碑
- **Batch 10 完成时**：全流程联调 + 手动验收

## Escalation Rules

- **何时回退到 planning**：Scope 发现必须扩充（如发现要加动画引擎）、架构决策需要推翻（如原生 JS 不够需要框架）
- **何时暂停实现**：连续 3 个 Task 的 TDD 测试结果与 Spec 行为矛盾、发现 Spec 内部矛盾未记录在本合同中
- **何时不得继续**：DP-3 未审批、Batch 审查不通过且无法在一个迭代内修复


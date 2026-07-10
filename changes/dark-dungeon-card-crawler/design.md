# Design: 暗黑地牢卡牌爬塔 — 架构设计

## Context

- 纯前端单页面应用，无框架依赖，HTML + CSS + JavaScript
- 无后端、无构建工具，浏览器直接打开 `index.html` 即运行
- 数据持久化使用 localStorage
- 架构需预留扩展空间：后续可增加新职业、新卡牌、新事件、联机模式

## Goals

1. **逻辑与 UI 解耦** — 核心引擎可不依赖 DOM 独立运行和测试
2. **数据驱动** — 卡牌/敌人/遗物/药水/事件全部从 JS 数据文件读取，新增内容即新增一行数据
3. **状态可序列化** — 存档 = 一局完整游戏状态的 JSON 快照，`JSON.stringify` 存、`JSON.parse` 取
4. **单文件入口** — `index.html` 为唯一入口，其余按模块拆分 `.js` 和 `.css` 文件

## Key Decisions

### 1. 无框架，原生 JS

**Choice**: HTML + CSS + 原生 JavaScript，零依赖。

**Rationale**: 项目体量可控（预计 <20 个 JS 文件），框架引入的构建步骤和运行时开销是净损失。浏览器原生 API 足够。

**Alternatives**: React/Vue — 功能过剩，增加 `npm install` + webpack/vite 构建步骤。保留为后续选项，当前不需要。

---

### 2. 事件驱动架构

**Choice**: GameEngine 作为事件总线，游戏状态变更时发射事件（`battleStart`、`cardPlayed`、`enemyTurn`、`playerDeath` 等），UI 层订阅事件并渲染。

**Rationale**: 
- 引擎可脱离 DOM 独立测试，传入模拟状态即可验证逻辑
- UI 层只做渲染，不持有业务状态
- 后续联机模式可直接复用引擎，仅替换 UI 层

**Alternatives**: 直连式（UI 直接操作状态）— 逻辑和渲染纠缠，难测试且难扩展。

**事件清单**:
| 事件 | 发射时机 |
|------|----------|
| `gameStart` | 新游戏开始 |
| `battleStart` | 进入战斗 |
| `turnStart` | 玩家回合开始 |
| `cardPlayed` | 玩家打出一张牌 |
| `enemyAction` | 敌人执行行动 |
| `enemyTurnEnd` | 所有敌人行动完毕 |
| `playerDamaged` | 玩家受到伤害 |
| `enemyDamaged` | 敌人受到伤害 |
| `enemyDefeated` | 敌人被击败 |
| `battleVictory` | 战斗胜利 |
| `playerDeath` | 玩家死亡 |
| `chapterStart` | 进入新章节 |
| `chapterCleared` | 章节通关 |
| `gameWon` | 通关 |
| `floorEnter` | 进入新楼层（存档点） |
| `relicGained` | 获得遗物 |
| `potionUsed` | 使用药水 |

---

### 3. 数据文件分离

**Choice**: 卡牌、敌人、遗物、药水、事件纯数据存在独立 JS 文件中，不含执行逻辑。引擎通过统一的 DSL 解析并执行效果。

**Rationale**: 新增一张卡牌 = 在 `cards.js` 中加一个对象，不改任何逻辑代码。平衡性调整只需改数据。

---

### 4. 效果 DSL（Domain-Specific Language）

所有卡牌、遗物、事件的效果使用统一的声明式 DSL 描述。引擎的 `combat.js` 和 `event-ui.js` 解析 DSL 并执行。

**卡牌效果 DSL 格式**:
```js
{
  id: 'slash',
  name: '斩击',
  class: 'warrior',      // warrior / mage / rogue / curse
  type: 'attack',         // attack / defense / ability / curse
  rarity: 'common',       // common / rare / legendary
  cost: 1,
  effects: [
    { type: 'damage', value: 6 }
  ],
  upgraded: {
    effects: [
      { type: 'damage', value: 9 }
    ]
  }
}
```

卡牌额外字段 casts（整型，默认 1）：连击牌设置 casts: 2 表示本回合该牌可打出 2 次。每次打出消耗能量，打出次数用完后方不可再打出。

复合效果示例（盾击）:
```js
{ cost: 1, effects: [
  { type: 'damage', value: 6 },
  { type: 'armor', value: 5 }
]}
```

升级数据: 每张卡牌额外定义 `upgraded` 字段，包含升级后的效果数组。`combat.js` 在打出卡牌时检查 `card.upgraded` 标志，若为 true 则使用 upgraded 中的效果值。

**效果类型表**:

| type | 参数 | 说明 |
|------|------|------|
| `damage` | `value` | 对目标造成伤害（受力量加成） |
| `aoeDamage` | `value` | 对所有敌人造成伤害 |
| `armor` | `value` | 获得护甲 |
| `poison` | `layers` | 施加中毒层数 |
| `burn` | `layers` | 施加灼烧层数 |
| `weak` | `turns` | 施加虚弱 |
| `vulnerable` | `turns` | 施加易伤 |
| `frail` | `turns` | 施加脆弱 |
| `stun` | — | 眩晕敌人 |
| `strength` | `value` | 增加力量 |
| `draw` | `count` | 抽牌 |
| `energy` | `value` | 获得能量 |
| `heal` | `value` | 回复 HP |
| `healPercent` | `percent` | 回复 HP 百分比 |
| `duplicate` | — | 复制手牌中一张牌（0 费） |
| `retrieve` | `count` | 从弃牌堆选牌回手（0 费） |
| `extraTurn` | — | 获得额外一个完整回合 |
| `execute` | `threshold, value` | HP 低于阈值时造成大量伤害 |
| `costReduce` | `value` | 本回合费用减免 |
| `poisonDamage` | `multiplier` | 中毒伤害倍率（如 2x） |

**事件效果 DSL 扩展类型**:

| type | 参数 | 说明 |
|------|------|------|
| `gainRelic` | `rarity` | 获得随机遗物 |
| `gainRelicChoice` | `rarity, count` | N 选 1 遗物 |
| `gainCard` | `rarity, class` | 获得随机卡牌 |
| `gainCardChoice` | `rarity, count` | N 选 1 卡牌 |
| `gainPotion` | `rarity` | 获得随机药水 |
| `loseHpFlat` | `value` | 失去固定 HP |
| `loseHpPercent` | `percent` | 失去百分比 HP |
| `removeCard` | — | 移除一张牌 |
| `upgradeCard` | — | 升级一张牌 |
| `gainCurse` | `count` | 获得诅咒牌 |
| `loseRelic` | `count` | 失去随机遗物 |
| `addBuff` | `buffType, turns` | 施加 buff（如下 3 场战斗能量 +1） |
| `shop` | `items` | 打开商店（物品列表） |
| `rest` | — | 打开休息点界面 |
| `fightMirror` | — | 触发镜像战斗 |

---

### 5. 存档 = GameState JSON

**Choice**: 整个游戏状态是一个 `GameState` 对象，序列化存 localStorage。读档时反序列化恢复。

**Rationale**: 简单、可审计。一个 JSON 包含所有必要信息，不依赖外部状态。

**GameState 结构**:
```js
{
  // 局设定
  class: 'warrior' | 'mage' | 'rogue',
  mode: 'mini' | 'short' | 'standard',
  difficulty: 'easy' | 'normal' | 'hard',
  
  // 当前进度
  chapter: 1 | 2 | 3,
  floor: number,            // 当前层（1-based）
  currentNode: number,      // 当前节点在地图上的索引
  
  // 玩家状态
  hp: number,
  maxHp: number,
  energy: number,           // 当前回合剩余能量
  strength: number,         // 当前力量
  armor: number,            // 当前护甲
  
  // 牌组
  deck: Card[],             // 抽牌堆
  hand: Card[],             // 手牌
  discardPile: Card[],      // 弃牌堆
  exhaustPile: Card[],      // 消耗区（BOSS 后回归）
  
  // 物品
  relics: Relic[],
  potions: Potion[],
  
  // 地图
  map: MapNode[],           // 所有节点
  pathTaken: number[],      // 已走过的节点索引
  
  // 进度
  enemiesDefeated: number,
  bossesDefeated: number,
  eventsEncountered: string[],  // 已触发的事件 ID，防止重复
  
  // 已击败的 BOSS ID（防止同一局重复）
  defeatedBossIds: string[],
  
  // 章节过渡标记
  enteringNewChapter: boolean
}
```

---

### 6. 遗物钩子系统

**Choice**: `relic.js` 维护一个钩子注册表。`game-engine.js` 在关键时机调用 `triggerHook(hookName, context)`，遍历所有遗物执行匹配的钩子。

**钩子清单**:

| 钩子 | 触发时机 | 示例遗物 |
|------|----------|----------|
| `onBattleStart` | 战斗开始 | 铁指环(+4护甲)、毒蛇之牙(+3毒)、战旗(首攻+4)、时光沙漏(多抽1)、龙之心(低血回血) |
| `onTurnStart` | 每回合开始 | 不破(+4护甲)、暗影分身(+2护甲+2毒)、力量图腾(每3回合+1力) |
| `onDamageDealt` | 造成伤害 | 吸血鬼之触(15%吸血)、死神镰刀(额外20%) |
| `onDamageTaken` | 受到伤害 | 荆棘护甲(反伤3) |
| `onEnemyKilled` | 击杀敌人 | 死灵书(回8HP) |
| `onDeath` | HP=0 | 凤凰羽毛(复活50%) |
| `onCardPlayed` | 打出卡牌 | 冰霜之心(+3护甲)、大法师之杖(3技能+1能) |
| `onEnterRest` | 进入休息点 | 治疗石(+10HP) |
| `onEnterShop` | 进入商店 | 复制镜(送复制药水) |
| `onPostBattle` | 战斗胜利 | 幸运币(+15%掉率)、冥想念珠(4选1) |

**钩子执行**: `onCardPlayed` 等高频钩子需要检查遗物的 `hook` 数据字段，只执行匹配的遗物。例如冰霜之心 `{ hook: 'onCardPlayed', condition: card => card.type === 'ability', effect: ctx => ctx.player.gainArmor(3) }`。

---

### 7. 回合制状态机

**Choice**: 战斗逻辑由显式状态机控制，状态不可跳跃。

**状态流转**: `PLAYER_TURN → ENEMY_TURN → PLAYER_TURN → ... → BATTLE_END`

每个状态有明确的进入条件、退出条件和可执行操作。`combat.js` 拒绝非法状态转换。

---

### 8. CSS 变量主题切换

**Choice**: 三章不同色调通过 CSS 变量在 `<body>` 上切换 `data-chapter` 属性实现。

```css
:root { --bg: #0a0a0f; --accent: #c0392b; --text: #ccc; --danger: #e74c3c; }
[data-chapter="1"] { --bg: #0d1117; --accent: #5b7a9a; }  /* 墓穴：灰蓝 */
[data-chapter="2"] { --bg: #12081a; --accent: #8b3a8b; }  /* 深渊：紫黑 */
[data-chapter="3"] { --bg: #1a0a08; --accent: #c0392b; }  /* 王座：金红 */
```

所有 UI 组件引用 CSS 变量，章节切换只需改一个属性。

---

### 9. CSS 文件拆分

**Choice**: 按界面拆分为三个 CSS 文件，避免单文件过大。

| 文件 | 内容 |
|------|------|
| `css/main.css` | CSS 变量、全局 reset、字体、按钮基础样式、菜单样式 |
| `css/battle.css` | 战斗界面：手牌区、敌人区、HP/护甲/能量条、意图图标、药水栏 |
| `css/map.css` | 地图界面：节点图标、连线、章节转场 |

---

### 10. 中毒/灼烧结算时机

中毒和灼烧的每回合伤害 SHALL 在敌人回合全部执行完毕后结算：玩家回合结束 → 敌人按随机顺序执行意图 → 所有敌人行动完毕 → 结算所有中毒/灼烧层数伤害 → 新的玩家回合开始。

`	ext
PLAYER_TURN → (回合结束) → ENEMY_TURN_1 → ENEMY_TURN_2 → ... → DOT_PHASE → PLAYER_TURN
`

combat.js 的状态机 SHALL 包含 DOT_PHASE 状态。

### 11. 敌人难度缩放

combat.js 的 initBattle() SHALL 在从 enemies.js 读取敌人数据后执行难度缩放：
- 简单：HP = base[0]，damage = base[0]
- 普通：HP = base[1]，damage = base[1]
- 困难：HP = base[2]，damage = base[2] + 从 hardVariations 随机选一种变化

### 12. 困难 AI 变化

**Choice**: 每个敌人在 `enemies.js` 中额外定义 `hardVariations` 数组。进入战斗时随机选一种。

```js
{ name: '骷髅兵', hp: [18,20,22], damage: [5,6,7], 
  intents: ['attack', 'defend(5)', 'attack'],
  hardVariations: [
    { name: '暴怒', effect: { damageMultiplier: 1.5 } },
    { name: '亡语', effect: { onDeath: { damage: 5 } } },
    { name: '铁壁', effect: { defendBonus: 10 } }
  ]
}
```

---

### 13. 错误处理策略

| 场景 | 策略 |
|------|------|
| localStorage 写满 | 静默失败，提示"存档失败，请清理浏览器存储" |
| 存档 JSON 损坏 | 删除损坏存档，当作无存档启动 |
| localStorage 不可用 | 游戏正常运行，存档/解锁功能禁用，"继续游戏"置灰 |
| 卡牌效果 DSL 未知类型 | `combat.js` 抛出 `console.warn` 并跳过该效果 |
| 浏览器不支持 ES6 | 无需处理（2026 年所有主流浏览器支持） |

---

## File Structure

```
index.html                  — 入口，挂载所有 CSS 和 JS 脚本
css/
  main.css                  — CSS 变量 + 全局 reset + 菜单样式
  battle.css                — 战斗界面样式
  map.css                   — 地图界面样式
js/
  data/
    cards.js                — 卡牌数据（含效果 DSL、升级数据）
    enemies.js              — 敌人数据（含意图循环、困难变化）
    relics.js               — 遗物数据（含 hook 字段）
    potions.js              — 药水数据
    events.js               — 随机事件数据（含效果 DSL）
  engine/
    game-engine.js          — 核心引擎：启动流程、状态管理、事件总线、存档
    combat.js               — 战斗逻辑：伤害、护甲、状态效果、敌人 AI
    map.js                  — 地图生成、路线逻辑
    deck.js                 — 牌组管理：抽牌、洗牌、战后选牌
    relic.js                — 遗物钩子系统
  ui/
    menu.js                 — 主菜单、模式/难度/职业选择
    battle-ui.js            — 战斗界面渲染
    map-ui.js               — 地图界面渲染
    event-ui.js             — 事件/商店/休息 UI + DSL 效果执行器
    chapter-ui.js           — 章节转场
    result-ui.js            — 战绩/分数展示
```

总计 19 个文件（1 HTML + 3 CSS + 15 JS）。每个 JS 文件职责单一，依赖通过 `<script>` 标签的加载顺序保证（`data → engine → ui`）。

## Risks & Trade-Offs

| 风险 | 缓解 |
|------|------|
| 无框架下 UI 状态管理可能混乱 | 事件驱动 + 单向数据流：引擎改状态 → 发射事件 → UI 重绘。UI 层不持有业务状态 |
| localStorage 5MB 限制 | GameState 单个存档 <10KB，远不到限制 |
| 动画/特效可能卡顿 | 首版不做复杂动画，CSS transition 足够。后续可引入 `requestAnimationFrame` 优化 |
| 数据文件随扩展变大 | 每个数据文件独立，按需在 HTML 中 `<script>` 加载 |
| 效果 DSL 扩展性 | 新效果类型需同时更新 DSL 文档和执行器。频率低，可控 |
| 事件系统内存泄漏 | 页面不刷新、长期运行下需注意取消订阅。首版单局生命周期短（<1 小时），风险低 |
| 无构建工具，代码组织靠文件 | 命名空间通过 `window.GameEngine` 等全局对象暴露，避免变量污染 |



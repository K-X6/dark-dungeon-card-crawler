# Tasks: 暗黑地牢卡牌爬塔

## File Structure

| 文件 | 职责 | 操作 |
|------|------|------|
| `index.html` | 入口，按序挂载所有 CSS/JS | Create |
| `css/main.css` | CSS 变量、全局 reset、菜单样式 | Create |
| `css/battle.css` | 战斗界面样式 | Create |
| `css/map.css` | 地图界面样式 | Create |
| `js/data/cards.js` | 所有卡牌数据（含效果 DSL） | Create |
| `js/data/enemies.js` | 敌人数据（含困难变化） | Create |
| `js/data/relics.js` | 遗物数据（含 hook 字段） | Create |
| `js/data/potions.js` | 药水数据 | Create |
| `js/data/events.js` | 随机事件数据（含效果 DSL） | Create |
| `js/engine/game-engine.js` | 核心引擎：启动流程、状态管理、事件总线、存档 | Create |
| `js/engine/deck.js` | 牌组管理：抽牌、洗牌、战后选牌 | Create |
| `js/engine/combat.js` | 战斗逻辑：伤害、护甲、状态效果、敌人 AI、难度缩放 | Create |
| `js/engine/relic.js` | 遗物钩子系统 | Create |
| `js/engine/map.js` | 地图生成、路线逻辑 | Create |
| `js/ui/shared.js` | 通用 UI 组件：showPicker（N选1，支持跳过） | Create |
| `js/ui/menu.js` | 主菜单、模式/难度/职业选择 | Create |
| `js/ui/battle-ui.js` | 战斗界面渲染 | Create |
| `js/ui/map-ui.js` | 地图界面渲染 | Create |
| `js/ui/event-ui.js` | 事件/商店/休息 UI + DSL 效果执行器 | Create |
| `js/ui/chapter-ui.js` | 章节转场 | Create |
| `js/ui/result-ui.js` | 战绩/分数展示 | Create |

## Interfaces

### 跨批次接口

**game-engine.js 导出：**
- `GameEngine.init(class, mode, difficulty)` → void — 初始化新游戏
- `GameEngine.getState()` → GameState — 获取当前完整状态
- `GameEngine.setState(path, value)` → void — 更新状态并发射事件
- `GameEngine.emit(eventName, payload)` → void — 发射事件
- `GameEngine.on(eventName, callback)` → void — 订阅事件
- `GameEngine.off(eventName, callback)` → void — 取消订阅
- `GameEngine.save()` → boolean — 保存到 localStorage
- `GameEngine.load()` → GameState|null — 从 localStorage 读取

**shared.js 导出：**
- `showPicker(options, config)` → Promise — options 为 {label, description}[] 数组，config 为 {allowSkip: bool, title: string}，返回选中项的索引或 -1（跳过）

## 批次分解

---

### Batch 1: 数据文件

依赖：无

#### Task 1.1: cards.js — 三职业卡牌数据

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\data\cards.js`

1. 编写测试：验证战士 16 张卡牌数据完整性（含 id/name/class/type/rarity/cost/effects/upgraded），起手牌组（10 张）可通过 class 筛选
2. 编写测试：验证法师 16 张卡牌数据完整性，验证奥术智慧 effect type='draw', count=2
3. 编写测试：验证盗贼 16 张卡牌数据完整性，验证毒镖 effect type='poison', layers=5
4. 编写测试：验证 5 张诅咒牌数据完整性，type='curse'，effects 含 curse 触发效果
5. 编写测试：验证连击牌 casts=2 字段，验证升级后数值变化
6. 实现：按设计文档填写 48 张基础卡牌 + 5 张诅咒牌 + 6 张解锁卡牌，使用效果 DSL 格式
7. 验证：所有测试通过，导出 `CARDS` 数组和 `STARTER_DECKS` 对象

#### Task 1.2: enemies.js — 敌人数据

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\data\enemies.js`

1. 编写测试：验证 9 个普通敌人完整数据（name/hp[3]/damage[3]/intents/chapter）
2. 编写测试：验证 3 个精英敌人完整数据
3. 编写测试：验证 8 个 BOSS 完整数据（含 bossOf 章节字段）
4. 编写测试：验证骷髅兵 hardVariations 有 3 种，每种有 name/effect
5. 实现：按设计文档填写全部敌人数据
6. 验证：所有测试通过，导出 `ENEMIES` 对象按 chapter 分组

#### Task 1.3: relics.js — 遗物数据

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\data\relics.js`

1. 编写测试：验证 23 个基础遗物 + 4 个解锁遗物数据完整性
2. 编写测试：验证每个遗物的 hook/rarity/effect 字段非空
3. 编写测试：验证凤凰羽毛 hook='onDeath'，铁指环 hook='onBattleStart'
4. 实现：按设计文档填写全部遗物数据
5. 验证：所有测试通过，导出 `RELICS` 对象按 rarity 分组

#### Task 1.4: potions.js — 药水数据

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\data\potions.js`

1. 编写测试：验证 9 种药水数据完整性（name/rarity/effect 字段）
2. 编写测试：验证凤凰药水 rarity='legendary'，治疗药水 effect type='heal'
3. 实现：按设计文档填写全部药水数据
4. 验证：所有测试通过，导出 `POTIONS` 对象

#### Task 1.5: events.js — 随机事件数据

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\data\events.js`

1. 编写测试：验证 12 个事件数据完整性（name/description/options 数组）
2. 编写测试：验证每个 option 的 effects 数组使用 DSL 类型，恶魔契约 loseHpPercent=20 和 gainRelic rarity='legendary'
3. 编写测试：验证幻象之间 option[0] effects 含 fightMirror
4. 实现：按设计文档填写全部事件数据
5. 验证：所有测试通过，导出 `EVENTS` 数组

---

### Batch 2: 核心引擎

依赖：Batch 1

#### Task 2.1: game-engine.js — 事件总线与状态管理

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\game-engine.js`

1. 编写测试：创建引擎后 getState() 返回 null
2. 编写测试：init('warrior', 'mini', 'easy') 后 getState().class === 'warrior'，hp=80，maxHp=80，energy=3，deck 含 10 张起手牌
3. 编写测试：setState('hp', 50) 发射 'stateChanged' 事件，payload 含 path 和 value
4. 编写测试：on('stateChanged', fn) 订阅，off('stateChanged', fn) 取消，emit 触发
5. 编写测试：save() 写入 localStorage key='darkdungeon_save'，load() 读取且状态一致
6. 编写测试：load() 无存档时返回 null，存档 JSON 损坏时返回 null 清空键
7. 实现：GameEngine 单例，内含 _state/_listeners，init/setState/emit/on/off/save/load 方法
8. 验证：所有测试通过

#### Task 2.2: game-engine.js — 初始化流程

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\game-engine.js`

1. 编写测试：init() 后 decks 按 class 取起手牌组并打乱作为抽牌堆
2. 编写测试：init() 后 potions 为空数组，relics 为空数组
3. 编写测试：init('warrior','standard','normal') 后 mode='standard', difficulty='normal', strength=0, armor=0
4. 编写测试：init() 后 chapter=1, floor=0, enteringNewChapter=true
5. 实现：init() 完整初始化 GameState 所有字段
6. 验证：所有测试通过

#### Task 2.3: deck.js — 牌组管理

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\deck.js`

1. 编写测试：drawCards(3) 从 deck 移 3 张到 hand
2. 编写测试：deck 不足时 discardPile 洗入 deck 后继续抽
3. 编写测试：discardHand() 将 hand 全部移入 discardPile
4. 编写测试：shuffleDeck() 随机打乱 deck 数组
5. 编写测试：addCardToDeck(card) 加入 deck，removeCardFromDeck(index) 移除
6. 编写测试：getDeckSize() 返回 deck+hand+discardPile 总数，最小为 5 时 removeCard 拒绝
7. 实现：Deck 模块，操作 GameEngine.getState() 中的 deck/hand/discardPile
8. 验证：所有测试通过

---

### Batch 3: 战斗引擎

依赖：Batch 2

#### Task 3.1: combat.js — 伤害与护甲

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\combat.js`

1. 编写测试：dealDamage(10) 对 8 护甲敌人：护甲变 0，HP 减 2
2. 编写测试：dealDamage(5) 对 10 护甲敌人：护甲变 5，HP 不变
3. 编写测试：gainArmor(5) 后 gainArmor(7) 当前护甲=12
4. 编写测试：endTurn() 时 armor 清零
5. 编写测试：dealDamage(10) with 3 strength 实际造成 13 伤害
6. 实现：damage/armor/strength 的增减函数，操作 GameState
7. 验证：所有测试通过

#### Task 3.2: combat.js — 状态效果

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\combat.js`

1. 编写测试：applyPoison(5) 后 applyPoison(4) 层数=9，DOT 结束后伤害=9 层数不减
2. 编写测试：applyBurn(5) 后 DOT 伤害=5 层数变 3
3. 编写测试：applyWeak(2) 后敌人攻击减半，2 回合后效果消失
4. 编写测试：applyVulnerable(1) 后敌人受伤 +50%
5. 编写测试：applyFrail(1) 后获得护甲减半
6. 编写测试：applyStun() 后敌人跳过完整一回合
7. 编写测试：同名状态施加两次只刷新持续时间不叠加效果
8. 实现：状态效果应用/清除/结算函数
9. 验证：所有测试通过

#### Task 3.3: combat.js — 效果 DSL 执行器

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\combat.js`

1. 编写测试：executeEffect({type:'damage',value:6}) 造成正确伤害
2. 编写测试：executeEffect({type:'aoeDamage',value:8}) 对所有敌人造成伤害
3. 编写测试：executeEffect({type:'poison',layers:5}) 施加中毒
4. 编写测试：executeEffect({type:'draw',count:2}) 抽 2 张牌
5. 编写测试：executeEffect({type:'strength',value:3}) 力量+3
6. 编写测试：executeEffect({type:'retainArmor'}) 标记护甲本回合不清零
7. 编写测试：executeEffect({type:'nextTurnEnergy',value:1}) 下回合+1能量
8. 编写测试：未知 effect type 时 console.warn 不崩溃
9. 实现：executeEffects(effects[]) 遍历执行所有效果
10. 验证：所有测试通过

#### Task 3.4: combat.js — 战斗状态机

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\combat.js`

1. 编写测试：startBattle(enemies) 进入 PLAYER_TURN 状态
2. 编写测试：endPlayerTurn() 切换到 ENEMY_TURN
3. 编写测试：敌人全部行动后进入 DOT_PHASE，然后 PLAYER_TURN
4. 编写测试：DOT_PHASE 结算所有中毒/灼烧
5. 编写测试：所有敌人 HP<=0 时进入 BATTLE_END
6. 编写测试：非法状态转换（playerTurn→playerTurn）被拒绝
7. 实现：状态机 + 5 个状态的处理逻辑
8. 验证：所有测试通过

#### Task 3.5: combat.js — 敌人 AI 与难度缩放

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\combat.js`

1. 编写测试：骷髅兵意图循环 攻击→防御→攻击 第 4 回合回到攻击
2. 编写测试：简单难度骷髅兵 hp=18 damage=5
3. 编写测试：困难难度骷髅兵 hp=22 damage=7 + 随机 hardVariation 生效
4. 编写测试：多敌人随机顺序行动
5. 编写测试：敌人被眩晕时跳过当前回合意图
6. 实现：executeEnemyTurn() 遍历所有存活敌人执行意图
7. 验证：所有测试通过

#### Task 3.6: relic.js — 遗物钩子系统

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\relic.js`

1. 编写测试：triggerHook('onBattleStart') 触发铁指环 +4 护甲
2. 编写测试：triggerHook('onDamageDealt',{damage:100}) 触发吸血鬼之触回 15 HP
3. 编写测试：triggerHook('onDeath') 触发凤凰羽毛复活
4. 编写测试：triggerHook('onCardPlayed',{card:{type:'ability'}}) 触发冰霜之心 +3 护甲
5. 编写测试：无对应遗物时 triggerHook 不报错
6. 编写测试：凤凰羽毛一次性消耗后不再触发
7. 实现：triggerHook 函数遍历 GameState.relics 执行匹配的 hook
8. 验证：所有测试通过

---

### Batch 4: 地图引擎

依赖：Batch 2

#### Task 4.1: map.js — 地图生成

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\map.js`

1. 编写测试：generateMap('mini') 生成 5-7 个节点的地图
2. 编写测试：generateMap('short') 生成 2 章，每章 4-6 节点
3. 编写测试：generateMap('standard') 生成 3 章，每章 5-7 节点
4. 编写测试：每层 2-3 条岔路连接下一层，形成无环 DAG
5. 编写测试：迷你模式每 4 层必有一个 BOSS 节点
6. 编写测试：短局/标准模式每 3 层必有一个 BOSS 节点
7. 编写测试：同一章内 BOSS 不重复抽取
8. 实现：generate(chapter) 返回 MapNode[]，generateFullMap(mode) 返回按章分组的节点数组
9. 验证：所有测试通过

#### Task 4.2: map.js — 路线逻辑

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\engine\map.js`

1. 编写测试：getAvailablePaths(currentNodeIndex) 返回可前进的下一层节点
2. 编写测试：advanceNode(nodeIndex) 更新 GameState.currentNode 和 floor
3. 编写测试：getNodeReward(nodeType) 返回对应奖励类型
4. 编写测试：isChapterEnd(node) 检测是否为当前章最终 BOSS
5. 实现：路线选择函数
6. 验证：所有测试通过

---

### Batch 5: UI 基础 + 主菜单

依赖：Batch 2

#### Task 5.1: css/main.css — 全局样式

**文件**: `C:\Users\11191\Desktop\codex制作项目\css\main.css`

1. 实现：CSS 变量定义（--bg, --accent, --text, --danger, --card-bg 等）
2. 实现：三章 `[data-chapter="1/2/3"]` 变量覆盖
3. 实现：全局 reset（*, body, button, h1-h3）
4. 实现：按钮基础样式（.btn, .btn-primary, .btn-disabled）
5. 实现：菜单容器样式（.menu-screen, .class-select 等）
6. 验证：三种章节模式下颜色变量正确切换，按钮 hover/active 反馈正常

#### Task 5.2: shared.js — 通用 UI 组件

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\ui\shared.js`

1. 编写测试：showPicker([{label:'A'},{label:'B'}],{allowSkip:false,title:'选择'}) 展示两个选项，Promise 返回选中索引
2. 编写测试：showPicker(...,{allowSkip:true}) 展示跳过按钮，点击跳过返回 -1
3. 编写测试：点击选项后 DOM 清除
4. 实现：showPicker 创建覆盖层，渲染选项列表，点击后 resolve Promise
5. 验证：所有测试通过

#### Task 5.3: menu.js — 主菜单流程

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\ui\menu.js`

1. 编写测试：加载时检测 localStorage 存档，有存档显示"继续游戏"可点击
2. 编写测试：无存档时"继续游戏"置灰
3. 编写测试："新游戏" → 选模式（迷你/短局/标准）→ 选难度（简单/普通/困难）→ 选职业（战士/法师/盗贼）→ 调用 GameEngine.init() 并发射 gameStart
4. 编写测试："继续游戏" → GameEngine.load() → 恢复状态 → 发射 gameStart
5. 编写测试：职业选择展示风味描述文字
6. 实现：菜单流程串联，DOM 渲染
7. 验证：所有测试通过

---

### Batch 6: 战斗 UI

依赖：Batch 3, Batch 5

#### Task 6.1: css/battle.css — 战斗界面样式

**文件**: `C:\Users\11191\Desktop\codex制作项目\css\battle.css`

1. 实现：战斗容器布局（玩家区左/中，敌人区右/上）
2. 实现：手牌区样式（横向排列，hover 放大，费用标注）
3. 实现：HP/护甲/能量条样式
4. 实现：敌人意图图标（剑/盾/星/骷髅等）及数值标注
5. 实现：药水栏样式（小瓶图标排列）
6. 实现：结束回合按钮、换牌按钮样式
7. 验证：不同视口下手牌区可滚动，按钮间距合理

#### Task 6.2: battle-ui.js — 战斗界面渲染

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\ui\battle-ui.js`

1. 编写测试：渲染手牌区，每张牌显示名称/费用/类型图标
2. 编写测试：渲染敌人区，显示 HP 条、意图图标和数值
3. 编写测试：渲染玩家 HP/护甲/能量，能量为 0 时卡牌不可点击
4. 编写测试：点击卡牌 → 目标选择箭头 → 点击敌人 → 打出卡牌
5. 编写测试：点击"结束回合" → 敌人回合 → 动画 → 新回合
6. 编写测试：药水点击 → 效果生效 → 图标消失
7. 编写测试：战斗开始换牌 → 重抽 → 或接受
8. 编写测试：战胜利 → showPicker（选牌 3 选 1，可跳过） → 回地图
9. 实现：battle-ui 订阅 engine.on 事件渲染
10. 验证：所有测试通过

---

### Batch 7: 地图 UI

依赖：Batch 4, Batch 5

#### Task 7.1: css/map.css — 地图界面样式

**文件**: `C:\Users\11191\Desktop\codex制作项目\css\map.css`

1. 实现：地图容器（纵向节点排列，分支连线）
2. 实现：节点图标（战斗=剑、精英=骷髅剑、BOSS=龙头、商店=金币、宝箱=箱子、休息=篝火、事件=?、诅咒=紫色?）
3. 实现：当前层高亮，可前进路线可点击
4. 实现：已走过节点变灰
5. 验证：节点图标分辨清晰，当前层视觉突出

#### Task 7.2: map-ui.js — 地图界面渲染

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\ui\map-ui.js`

1. 编写测试：渲染当前章全部节点，显示连线
2. 编写测试：点击可前进节点 → 更新 currentNode → 触发对应事件（战斗/事件/商店等）
3. 编写测试：已走过节点不可点击
4. 编写测试：章节结束时发射 chapterCleared
5. 实现：订阅 engine.on 事件渲染地图
6. 验证：所有测试通过

---

### Batch 8: 事件/商店/休息 UI

依赖：Batch 2, Batch 5

#### Task 8.1: event-ui.js — 事件系统

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\ui\event-ui.js`

1. 编写测试：进入事件节点 → 从 EVENTS 数组随机选一个未出现过的事件 → 渲染事件文本和选项按钮
2. 编写测试：点击选项 → executeEventEffects(effects[]) → 操作 GameState → 返回地图
3. 编写测试：executeEventEffects 支持 gainRelic/gainCard/loseHpFlat/loseHpPercent/removeCard/upgradeCard/gainCurse/gainPotion/addBuff 等全部 DSL 类型
4. 编写测试：事件已触发后加入已触发列表，同局不再出现
5. 实现：event-ui 模块
6. 验证：所有测试通过

#### Task 8.2: event-ui.js — 商店系统

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\ui\event-ui.js`

1. 编写测试：进入商店 → 展示 6 类商品及价格（15/30/10/40/60/25 HP）
2. 编写测试：点击购买普通卡牌 → showPicker（3 选 1） → HP-15 → 卡牌加入 deck
3. 编写测试：HP 不足时购买选项置灰
4. 编写测试：点击"离开商店"返回地图
5. 实现：商店 UI
6. 验证：所有测试通过

#### Task 8.3: event-ui.js — 休息点系统

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\ui\event-ui.js`

1. 编写测试：进入休息点 → "回复 30% HP"和"升级一张牌"两个选项
2. 编写测试：选择回血 → HP += Math.ceil(maxHp * 0.3) → 持有治疗石额外 +10
3. 编写测试：选择升级 → showPicker（所有未升级牌） → 选一张升级 → 更新牌数据
4. 编写测试：所有牌已升级时升级选项置灰
5. 实现：休息点 UI
6. 验证：所有测试通过

---

### Batch 9: 章节 + 战绩

依赖：Batch 3, Batch 5

#### Task 9.1: chapter-ui.js — 章节转场

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\ui\chapter-ui.js`

1. 编写测试：chapterCleared 事件 → 显示章节名 + "已征服"文字
2. 编写测试：章节结算 → 回满 HP → showPicker（3 个稀有遗物选 1） → showPicker（3 张随机稀有度牌选 1）
3. 编写测试：消耗区所有牌回归 deck
4. 编写测试：选完后进入下一章地图（body data-chapter 更新）
5. 实现：章节 UI
6. 验证：所有测试通过

#### Task 9.2: result-ui.js — 战绩与分数

**文件**: `C:\Users\11191\Desktop\codex制作项目\js\ui\result-ui.js`

1. 编写测试：gameWon 事件 → 计算总分并显示完整战绩
2. 编写测试：分数 = (层数×100 + 击杀×10 + BOSS×200 + 剩余HP×3 + 遗物×15 + 精简分) × 模式倍率 × 难度倍率
3. 编写测试：死亡时显示战绩（无分数）
4. 编写测试：通关触发解锁逻辑（首次该职业通关 → 保存解锁状态）
5. 实现：战绩 UI + 分数计算 + 解锁逻辑
6. 验证：所有测试通过

---

### Batch 10: 入口集成 + 全流程联调

依赖：Batch 1-9

#### Task 10.1: index.html — 入口集成

**文件**: `C:\Users\11191\Desktop\codex制作项目\index.html`

1. 创建 HTML 骨架，按序加载 CSS 和 JS：css → data → engine → ui
2. 验证：浏览器打开后主菜单正常显示
3. 验证：选职业→第一场战斗→战后选牌→地图，全流程不报错
4. 验证：标准模式完整一局后战绩展示正确
5. 验证：困难模式下敌人有变化标识

#### Task 10.2: 镜像战斗联调

**文件**: 无新文件（修改 event-ui.js + combat.js）

1. 实现：事件"幻象之间"选择战斗→ startBattle(mirror) → 镜像复制玩家 HP+deck 无遗物
2. 验证：镜像从左到右机械出牌
3. 验证：胜利获稀有卡牌，失败 -10HP 回地图

#### Task 10.3: 存档联调

**文件**: 无新文件（验证 game-engine.js）

1. 验证：进入新楼层自动 save()
2. 验证：关闭浏览器重开，主菜单"继续游戏"可点击
3. 验证：继续后从存档楼层开始
4. 验证：死亡后存档清除
5. 验证：通关后存档清除

#### Task 10.4: 解锁联调

**文件**: 无新文件（验证 result-ui.js）

1. 验证：战士首次通关 → 裂地斩/钢铁意志/狂战士护腕加入池
2. 验证：三职业全通 → 命运之轮加入遗物池
3. 验证：解锁状态 localStorage 持久化，关浏览器重开仍在

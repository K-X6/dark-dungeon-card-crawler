# 战斗逻辑代码优化设计

## 目标

本轮优化只整理战斗逻辑的代码结构，不改变现有玩法、数值、卡牌效果、敌人行为或 UI 对外表现。

优化重点是让 `js/engine/combat.js` 更容易维护，减少后续新增卡牌、敌人、遗物时引入战斗流程 bug 的概率。

## 当前问题

`combat.js` 同时承担了这些职责：

- 战斗开始与回合状态推进
- 玩家出牌流程
- 敌人意图执行
- 伤害、护甲、死亡、胜负判断
- 中毒、灼烧、虚弱、易伤、眩晕等状态效果
- 卡牌效果 DSL 执行
- 遗物钩子和事件通知

这些逻辑都在同一个模块里是可以接受的，但现在胜负判断、存活敌人过滤、死亡敌人处理等判断分散在多个位置。之前出现过战斗结束 UI 被刷新覆盖、死亡敌人重复闪烁、失败节点错误推进等问题，这类问题都和“战斗终止状态不够集中”有关。

## 方案

采用保守整理方案：保留 `combat.js` 单文件和所有外部 API，不拆新文件。

新增或整理内部辅助函数：

- `getLivingEnemies()`：统一返回仍存活的敌人。
- `isBattleWon()`：统一判断是否所有敌人都已死亡。
- `isPlayerDead()`：统一判断玩家是否死亡。
- `finishBattle(result)`：统一设置 `BATTLE_END`、发出战斗结束事件，并避免重复触发。
- `markEnemyDefeated(enemy)`：统一处理敌人死亡标记和 `enemyDefeated` 事件。
- `canContinueBattle()`：在关键流程里快速阻止终局后继续推进。

整理重点：

- 玩家回合结束、敌人回合、DOT 结算、打牌后伤害结算都通过同一套终局检查。
- 敌人行动、随机目标、AOE、DOT 只处理存活敌人。
- 敌人死亡事件只触发一次。
- 保持 `Combat.startBattle`、`Combat.endPlayerTurn`、`Combat.playCard`、`Combat.getEnemies` 等外部调用方式不变。

## 不做的事

本轮不做以下改动：

- 不调整任何卡牌、敌人、遗物、药水数值。
- 不改变战斗 UI 布局。
- 不拆分新 JS 文件。
- 不重写整个状态机。
- 不新增新玩法。

## 验证

修改完成后运行：

- `node test/batch2-test.js`
- `node test/batch3-test.js`
- `node test/batch4-test.js`
- `node test/regression-test.js`
- 所有 `.js` 文件语法检查
- `git diff --check`

通过标准：

- 现有测试全部通过。
- 没有语法错误。
- 没有非预期空白错误。
- 游戏对外行为保持不变。

## 回滚与提交规则

当前优化基准提交为 `2abc906 checkpoint before code optimization`。

后续修改期间：

- 用户输入 `回滚` 时，恢复到该基准提交对应内容。
- 用户输入 `commit` 时，才提交当前改动。
- 不在每次小修改后自动提交。

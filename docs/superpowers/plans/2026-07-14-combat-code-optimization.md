# Combat Code Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `js/engine/combat.js` internals so battle terminal-state checks, living-enemy filtering, and defeat handling are centralized without changing gameplay behavior.

**Architecture:** Keep `combat.js` as one module and preserve the public `window.Combat` API. Add small private helper functions near the top of the module, then route existing battle flow, enemy iteration, DOT handling, and card play through those helpers.

**Tech Stack:** Plain browser JavaScript, existing `window.GameEngine`, `window.Deck`, `window.Relic`, and Node-based tests.

## Global Constraints

- Do not change gameplay, card numbers, enemy numbers, relic effects, potion effects, or visible UI behavior.
- Do not split new JavaScript files.
- Do not change public `window.Combat` function names or return values.
- Do not commit automatically; commit only when the user explicitly says `commit`.
- Preserve rollback baseline `2abc906 checkpoint before code optimization`.

---

## File Structure

- Modify: `js/engine/combat.js`
  - Add private terminal-state helpers.
  - Replace repeated `_enemies.every(e => e.hp <= 0)` and `state.hp <= 0` checks with shared helpers.
  - Replace direct living-enemy loops with `getLivingEnemies()`.
- Verify: `test/batch2-test.js`, `test/batch3-test.js`, `test/batch4-test.js`, `test/regression-test.js`
  - Existing tests must keep passing.

---

### Task 1: Add Battle Terminal Helpers

**Files:**
- Modify: `js/engine/combat.js`

**Interfaces:**
- Consumes: private `_phase`, `_enemies`, `window.GameEngine.getState()`, `window.GameEngine.emit()`, `window.Relic.triggerHook()`.
- Produces: private helpers `getLivingEnemies()`, `isBattleWon()`, `isPlayerDead()`, `finishBattle(result)`, `canContinueBattle()`, `markEnemyDefeated(enemy)`.

- [ ] **Step 1: Add helpers near the existing getters**

Add this block after `getTurnCount()`:

```js
  function getLivingEnemies() {
    return _enemies.filter(enemy => enemy.hp > 0);
  }

  function isBattleWon() {
    return _enemies.length > 0 && getLivingEnemies().length === 0;
  }

  function isPlayerDead() {
    const state = window.GameEngine.getState();
    return !!state && state.hp <= 0;
  }

  function finishBattle(result) {
    if (_phase === 'BATTLE_END') return true;
    _phase = 'BATTLE_END';
    if (result === 'victory') {
      window.GameEngine.emit('battleVictory', {});
    }
    return true;
  }

  function canContinueBattle() {
    if (_phase === 'BATTLE_END') return false;
    if (isPlayerDead()) return !finishBattle('defeat');
    if (isBattleWon()) return !finishBattle('victory');
    return true;
  }

  function markEnemyDefeated(enemy) {
    if (!enemy || enemy.hp > 0 || enemy._defeatEmitted) return;
    enemy._defeatEmitted = true;
    window.GameEngine.emit('enemyDefeated', { enemy });
    window.Relic.triggerHook('onEnemyKilled', { enemy });
  }
```

- [ ] **Step 2: Run syntax check**

Run:

```powershell
foreach ($f in Get-ChildItem -Recurse -Filter *.js) { node --check $f.FullName }
```

Expected: command exits 0 with no syntax errors.

---

### Task 2: Route Existing Victory and Defeat Checks Through Helpers

**Files:**
- Modify: `js/engine/combat.js`

**Interfaces:**
- Consumes: helpers from Task 1.
- Produces: unchanged behavior for `startBattle()`, `endPlayerTurn()`, and `executeEnemyTurn()`.

- [ ] **Step 1: Replace direct terminal checks in `endPlayerTurn()`**

Change the beginning and mid-flow checks to:

```js
    if (!canContinueBattle()) return;
    decayPlayerEffects();
    triggerCursesInHand();
    if (!canContinueBattle()) return;
```

After `executeEnemyTurn();`, remove the repeated `_enemies.every(...)` victory block because `executeEnemyTurn()` will own that check.

- [ ] **Step 2: Replace direct terminal checks in `executeEnemyTurn()`**

Use `getLivingEnemies()` for the randomized order:

```js
    const order = getLivingEnemies().sort(() => Math.random() - 0.5);
```

After each enemy intent, replace direct HP break checks with:

```js
      if (!canContinueBattle()) break;
```

Before DOT:

```js
    if (!canContinueBattle()) return;
```

After DOT:

```js
    if (!canContinueBattle()) return;
```

- [ ] **Step 3: Run combat and regression tests**

Run:

```powershell
node test/batch3-test.js
node test/regression-test.js
```

Expected: both commands report 0 failed.

---

### Task 3: Centralize Living-Enemy Loops

**Files:**
- Modify: `js/engine/combat.js`

**Interfaces:**
- Consumes: `getLivingEnemies()`.
- Produces: unchanged effects for enemy selection, AOE damage, AOE poison, weak-all, and DOT.

- [ ] **Step 1: Update living-enemy loops**

Replace loops of this shape:

```js
for (const enemy of _enemies) if (enemy.hp > 0) ...
```

with:

```js
for (const enemy of getLivingEnemies()) ...
```

Apply this to:

- `beginPlayerTurn()` armor-and-poison-per-turn buff
- `tickAllDot()`
- DSL handlers for `aoeDamage`, `aoePoison`, `weak` without target, `stun` without target, and any other all-enemy effect that currently manually checks `hp > 0`
- random target selection in enemy summon/chain logic where a living target is required

- [ ] **Step 2: Run combat and regression tests**

Run:

```powershell
node test/batch3-test.js
node test/regression-test.js
```

Expected: both commands report 0 failed.

---

### Task 4: Centralize Enemy Defeat Emission

**Files:**
- Modify: `js/engine/combat.js`

**Interfaces:**
- Consumes: `markEnemyDefeated(enemy)`.
- Produces: unchanged `enemyDamaged`, `enemyDefeated`, and `onEnemyKilled` behavior.

- [ ] **Step 1: Update `dealDamageToEnemy()`**

Replace:

```js
    if (target.hp <= 0 && !target._defeatEmitted) {
      target._defeatEmitted = true;
      window.GameEngine.emit('enemyDefeated', { enemy: target });
      window.Relic.triggerHook('onEnemyKilled', {enemy:target});
    }
```

with:

```js
    markEnemyDefeated(target);
```

- [ ] **Step 2: Add terminal check after card effects**

In `playCard()`, after relic `onCardPlayed`, call:

```js
    canContinueBattle();
```

Keep returning `true` after a successful card play.

- [ ] **Step 3: Run combat and regression tests**

Run:

```powershell
node test/batch3-test.js
node test/regression-test.js
```

Expected: both commands report 0 failed.

---

### Task 5: Final Verification

**Files:**
- Verify only.

- [ ] **Step 1: Run full test set**

Run:

```powershell
node test/batch2-test.js
node test/batch3-test.js
node test/batch4-test.js
node test/regression-test.js
```

Expected:

- `batch2`: 0 failed
- `batch3`: 0 failed
- `batch4`: 0 failed
- `regression`: 0 failed

- [ ] **Step 2: Run syntax and whitespace checks**

Run:

```powershell
foreach ($f in Get-ChildItem -Recurse -Filter *.js) { node --check $f.FullName }
git diff --check
```

Expected: syntax check exits 0, `git diff --check` exits 0. Windows LF-to-CRLF warnings are acceptable.

- [ ] **Step 3: Report changed files**

Run:

```powershell
git status -sb
git diff --stat
```

Expected: only the design doc, this plan, and `js/engine/combat.js` are modified or untracked unless a required test update becomes necessary.

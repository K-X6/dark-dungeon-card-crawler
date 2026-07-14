# Result Screen Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade victory and death result screens into clearer run-summary screens with score rank, best-score feedback, stat cards, and polished layout.

**Architecture:** Keep `window.ResultUI` inside `js/ui/chapter-ui.js`. Add small private formatting/stat helpers, update `showVictory()` and `showDeath()` markup, and move result-screen visuals into `css/main.css`.

**Tech Stack:** Plain HTML/CSS/JavaScript, localStorage for lightweight records, existing Node regression tests, browser validation through Playwright or direct browser automation.

## Global Constraints

- Do not change combat, map, card, enemy, relic, or potion gameplay values.
- Do not introduce dependencies or build tooling.
- Do not automatically commit; commit only when the user explicitly says `commit`.
- Keep rollback baseline `2abc906 checkpoint before code optimization`.

---

## File Structure

- Modify: `js/ui/chapter-ui.js`
  - Add result helpers.
  - Improve victory and death result markup.
  - Save best score before rendering victory.
  - Reset win streak on death.
- Modify: `css/main.css`
  - Add reusable result-screen layout classes.
- Modify: `test/regression-test.js`
  - Add focused checks for new result helper behavior if accessible through rendered UI.

---

### Task 1: Add Result Helper Functions

**Files:**
- Modify: `js/ui/chapter-ui.js`

**Interfaces:**
- Produces private helpers: `getClassName(cls)`, `getModeName(mode)`, `getDifficultyName(difficulty)`, `calculateScoreBreakdown(state, deckSize)`, `getScoreGrade(score, mode)`, `saveBestScore(score)`, `getRunComment(state, won)`.

- [ ] Add helpers inside `window.ResultUI`, before `showVictory()`.
- [ ] Keep helpers private; do not change the public return object.
- [ ] Run `node --check js/ui/chapter-ui.js`.

### Task 2: Polish Victory Result

**Files:**
- Modify: `js/ui/chapter-ui.js`
- Modify: `css/main.css`

**Interfaces:**
- Consumes helpers from Task 1.
- Keeps `ResultUI.showVictory()` public behavior.

- [ ] Replace inline victory markup with `.result-panel`, `.result-hero`, `.result-grid`, `.score-breakdown`, and `.result-actions` markup.
- [ ] Save best score before rendering, and show `新纪录` when applicable.
- [ ] Show grade, total score, streak, run summary, and score breakdown.
- [ ] Run `node test/regression-test.js`.

### Task 3: Polish Death Result

**Files:**
- Modify: `js/ui/chapter-ui.js`
- Modify: `css/main.css`

**Interfaces:**
- Keeps `ResultUI.showDeath()` public behavior.
- Keeps retry current node logic unchanged.

- [ ] Reset `darkdungeon_streak` to `0` on death.
- [ ] Render death screen using the same result layout classes.
- [ ] Show chapter/floor, run summary, death count, and a contextual comment.
- [ ] Keep retry and end-run buttons working with the same IDs.
- [ ] Run `node test/regression-test.js`.

### Task 4: Full Verification and Browser Run

**Files:**
- Verify only unless a bug is found.

- [ ] Run full tests:

```powershell
node test/batch2-test.js
node test/batch3-test.js
node test/batch4-test.js
node test/regression-test.js
```

- [ ] Run syntax and whitespace checks:

```powershell
foreach ($f in Get-ChildItem -Recurse -Filter *.js) { node --check $f.FullName }
git diff --check
```

- [ ] Open the app in a browser and verify:
  - Main menu renders without console errors.
  - Victory result screen renders with grade, score, stat cards, and return button.
  - Death result screen renders with retry/end buttons.
  - Desktop and mobile-sized viewports do not visibly overflow.

- [ ] Report final changed files and verification results without committing.

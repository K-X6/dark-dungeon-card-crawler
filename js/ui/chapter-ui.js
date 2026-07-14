// 暗黑地牢卡牌爬塔 — 章节转场 + 战绩
window.ChapterUI = (() => {
  async function showCleared(chapterNum) {
    const state = window.GameEngine.getState();
    const chapterNames = ['', '墓穴', '深渊', '王座之间'];

    // 回满血
    state.hp = state.maxHp;
    // 消耗牌回归
    state.deck.push(...state.exhaustPile);
    state.exhaustPile = [];
    state.enteringNewChapter = false;

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay">
        <div class="overlay-content">
          <h2>第 ${chapterNum} 章：${chapterNames[chapterNum]}</h2>
          <div style="font-size:24px;color:var(--accent);margin:16px 0">已征服</div>
          <button id="btn-continue">继续</button>
        </div>
      </div>
    `;

    document.getElementById('btn-continue').addEventListener('click', async () => {
      // BOSS奖励：选遗物 + 选牌
      const rareRelics = window.RELICS.rare;
      const relicOptions = [];
      for (let i = 0; i < 3; i++) {
        relicOptions.push(rareRelics[Math.floor(Math.random() * rareRelics.length)]);
      }
      const relicIdx = await window.showPicker(
        relicOptions.map(r => ({label: r.name, description: r.description})),
        {title: '选择遗物', allowSkip: false}
      );
      if (relicIdx >= 0) state.relics.push(JSON.parse(JSON.stringify(relicOptions[relicIdx])));

      // 选牌（随机稀有度）
      const cardOptions = [];
      for (let i = 0; i < 3; i++) {
        const pool = window.CARDS.filter(c => c.type !== 'curse' && (c.class === state.class));
        cardOptions.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      const cardIdx = await window.showPicker(
        cardOptions.map(c => ({label: `${c.name} (${c.rarity})`})),
        {title: '选择一张牌', allowSkip: true}
      );
      if (cardIdx >= 0) window.Deck.addCardToDeck(cardOptions[cardIdx]);

      // 下一章
      state.chapter++;
      const mapData = window.Map.generateFullMap(state.mode);
      const nextChapter = mapData[state.chapter - 1];
      if (nextChapter) {
        state.map = nextChapter.nodes;
        state.currentNode = 0;
        state.pathTaken = [];
        state.floor = nextChapter.nodes[0].floor;
        state.enteringNewChapter = true;
        document.body.dataset.chapter = state.chapter;
        window.MapUI.show();
      }
    });
  }

  return { showCleared };
})();

window.ResultUI = (() => {
  function getClassName(cls) {
    return { warrior: '战士', mage: '法师', rogue: '盗贼' }[cls] || cls;
  }

  function getModeName(mode) {
    return { mini: '迷你', short: '短局', standard: '标准' }[mode] || mode;
  }

  function getDifficultyName(difficulty) {
    return { easy: '简单', normal: '普通', hard: '困难' }[difficulty] || difficulty;
  }

  function getChapterName(chapter) {
    return ['', '墓穴', '深渊', '王座之间'][chapter] || '未知章节';
  }

  function calculateScoreBreakdown(state, deckSize) {
    const modeMultiplier = { mini: 0.5, short: 1.0, standard: 2.0 }[state.mode] || 1;
    const diffMultiplier = { easy: 0.7, normal: 1.0, hard: 1.5 }[state.difficulty] || 1;
    const slimBonus = Math.max(0, (30 - deckSize) * 5);
    const parts = {
      floor: state.floor * 100,
      kills: state.enemiesDefeated * 10,
      bosses: state.bossesDefeated * 200,
      hp: state.hp * 3,
      relics: state.relics.length * 15,
      slim: slimBonus
    };
    const baseScore = parts.floor + parts.kills + parts.bosses + parts.hp + parts.relics + parts.slim;
    return {
      parts,
      baseScore,
      modeMultiplier,
      diffMultiplier,
      totalScore: Math.floor(baseScore * modeMultiplier * diffMultiplier)
    };
  }

  function getScoreGrade(score, mode) {
    const scale = mode === 'mini' ? 0.5 : mode === 'short' ? 1 : 1.4;
    if (score >= 2200 * scale) return 'S';
    if (score >= 1600 * scale) return 'A';
    if (score >= 1000 * scale) return 'B';
    return 'C';
  }

  function saveBestScore(score) {
    try {
      const previousBest = parseInt(localStorage.getItem('darkdungeon_bestscore') || '0', 10);
      const bestScore = Math.max(previousBest, score);
      localStorage.setItem('darkdungeon_bestscore', '' + bestScore);
      return { previousBest, bestScore, isNewBest: score > previousBest };
    } catch(e) {
      return { previousBest: 0, bestScore: score, isNewBest: false };
    }
  }

  function incrementStreak() {
    try {
      const streak = parseInt(localStorage.getItem('darkdungeon_streak') || '0', 10) + 1;
      localStorage.setItem('darkdungeon_streak', '' + streak);
      return streak;
    } catch(e) {
      return 0;
    }
  }

  function resetStreak() {
    try { localStorage.setItem('darkdungeon_streak', '0'); } catch(e) {}
  }

  function getRunComment(state, won) {
    if (won) {
      if (state.difficulty === 'hard') return '黑暗没有放水，你也没有。';
      if (state.bossesDefeated >= 3) return '王座之间已经记住了你的名字。';
      return '这趟地牢，被你完整带回了火光。';
    }
    if (state.chapter >= 3) return '你已经走到王座前，下一次会更近。';
    if (state.bossesDefeated > 0) return '你击倒过真正的守门者，这局不是白走。';
    return '一次失败的远征，也是一张更清楚的地图。';
  }

  function statCard(label, value) {
    return '<div class="result-stat"><span>' + label + '</span><strong>' + value + '</strong></div>';
  }

  function scoreLine(label, value) {
    return '<div><span>' + label + '</span><strong>' + value + '</strong></div>';
  }

  function showVictory() {
    const state = window.GameEngine.getState();
    const deckSize = window.Deck.getDeckSize();
    const score = calculateScoreBreakdown(state, deckSize);
    const grade = getScoreGrade(score.totalScore, state.mode);
    const best = saveBestScore(score.totalScore);
    const streak = incrementStreak();

    // 解锁
    unlockCheck(state.class);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay" style="animation:fadeIn 0.5s">
        <div class="overlay-content result-panel result-victory">
          <div class="result-hero">
            <div class="result-icon">🏆</div>
            <div>
              <div class="result-kicker">远征完成</div>
              <h2>胜利！</h2>
              <p>${getRunComment(state, true)}</p>
            </div>
            <div class="result-grade">${grade}</div>
          </div>

          <div class="result-score">
            <span>${score.totalScore}</span>
            <small>总分 ${best.isNewBest ? '· 新纪录' : '· 最高 ' + best.bestScore}</small>
          </div>

          <div class="result-grid">
            ${statCard('职业', getClassName(state.class))}
            ${statCard('模式', getModeName(state.mode) + ' · ' + getDifficultyName(state.difficulty))}
            ${statCard('层数', '第 ' + state.floor + ' 层')}
            ${statCard('连胜', streak + ' 局')}
            ${statCard('击杀', state.enemiesDefeated)}
            ${statCard('BOSS', state.bossesDefeated)}
            ${statCard('剩余 HP', state.hp + '/' + state.maxHp)}
            ${statCard('牌组', deckSize + ' 张')}
            ${statCard('遗物', state.relics.length + ' 个')}
          </div>

          <div class="score-breakdown">
            ${scoreLine('层数', score.parts.floor)}
            ${scoreLine('击杀', score.parts.kills)}
            ${scoreLine('BOSS', score.parts.bosses)}
            ${scoreLine('生命', score.parts.hp)}
            ${scoreLine('遗物', score.parts.relics)}
            ${scoreLine('精简牌组', score.parts.slim)}
            ${scoreLine('模式倍率', 'x' + score.modeMultiplier)}
            ${scoreLine('难度倍率', 'x' + score.diffMultiplier)}
          </div>

          <div class="result-actions">
            <button id="btn-menu" class="btn-primary">返回主菜单</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btn-menu').addEventListener('click', () => {
      localStorage.removeItem('darkdungeon_save');
      document.body.classList.remove('death-vignette');
      window.Menu.show();
    });
  }

  function showDeath() {
    document.body.classList.add('death-vignette');
    resetStreak();
    let deaths = 0;
    try {
      deaths = parseInt(localStorage.getItem('darkdungeon_deaths')||'0', 10) + 1;
      localStorage.setItem('darkdungeon_deaths',''+deaths);
    } catch(e){}
    const state = window.GameEngine.getState();
    const deckSize = window.Deck.getDeckSize();
    let canRetry = false;
    try { canRetry = !!localStorage.getItem('darkdungeon_save'); } catch(e) {}
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay" style="animation:fadeIn 0.5s">
        <div class="overlay-content result-panel result-death">
          <div class="result-hero">
            <div class="result-icon">💀</div>
            <div>
              <div class="result-kicker">远征中断</div>
              <h2>战死</h2>
              <p>${getRunComment(state, false)}</p>
            </div>
            <div class="result-grade">败</div>
          </div>

          <div class="result-score">
            <span>第 ${state.chapter} 章 · 第 ${state.floor} 层</span>
            <small>${getChapterName(state.chapter)} · 历史死亡 ${deaths} 次</small>
          </div>

          <div class="result-grid">
            ${statCard('职业', getClassName(state.class))}
            ${statCard('模式', getModeName(state.mode) + ' · ' + getDifficultyName(state.difficulty))}
            ${statCard('击杀', state.enemiesDefeated)}
            ${statCard('BOSS', state.bossesDefeated)}
            ${statCard('遗物', state.relics.length + ' 个')}
            ${statCard('牌组', deckSize + ' 张')}
            ${statCard('当前 HP', state.hp + '/' + state.maxHp)}
            ${statCard('连胜', '已清零')}
          </div>

          <div class="result-actions">
            ${canRetry ? '<button id="btn-retry" class="btn-primary">重新挑战当前节点</button>' : ''}
            <button id="btn-menu">结束本局并返回主菜单</button>
          </div>
        </div>
      </div>
    `;
    if (canRetry) document.getElementById('btn-retry').addEventListener('click', () => {
      const restored = window.GameEngine.load();
      if (!restored) { window.Menu.show(); return; }
      restored.pathTaken = (restored.pathTaken || []).filter(index => index !== restored.currentNode);
      window.GameEngine.save();
      document.body.classList.remove('death-vignette');
      window.GameEngine.emit('gameStart', {retry:true});
    });
    document.getElementById('btn-menu').addEventListener('click', () => {
      localStorage.removeItem('darkdungeon_save');
      document.body.classList.remove('death-vignette');
      window.Menu.show();
    });
  }

  function unlockCheck(cls) {
    try {
      var unlocks = JSON.parse(localStorage.getItem('darkdungeon_unlocks') || '{}');
      var isNew = !unlocks[cls];
      unlocks[cls] = true;
      localStorage.setItem('darkdungeon_unlocks', JSON.stringify(unlocks));
      if (isNew) {
        var items = getUnlockItems(cls);
        showUnlockPopup(cls, items);
      }
    } catch(e) {}
  }
  
  function getUnlockItems(cls) {
    var items = [];
    var allCards = window.CARDS || [];
    var unlockedCards = allCards.filter(function(c){return c.unlock === cls;});
    for (var i = 0; i < unlockedCards.length; i++) {
      items.push({type:'card', name: unlockedCards[i].name});
    }
    var relics = window.RELICS || {};
    if (relics.unlock && relics.unlock[cls]) {
      items.push({type:'relic', name: relics.unlock[cls].name});
    }
    return items;
  }
  
  function showUnlockPopup(cls, items) {
    var classNames = {warrior:'战士', mage:'法师', rogue:'盗贼'};
    var html = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:600" id="unlock-popup">';
    html += '<div style="font-size:36px;margin-bottom:8px">🔓</div>';
    html += '<h2 style="color:var(--gold);font-size:24px">' + (classNames[cls]||cls) + ' 通关！</h2>';
    html += '<div style="color:var(--text);margin:12px 0;text-align:center">已解锁：</div>';
    for (var i = 0; i < items.length; i++) {
      var icon = items[i].type === 'card' ? '🃏' : '💎';
      html += '<div style="color:var(--gold);font-size:18px;margin:4px 0">' + icon + ' ' + items[i].name + '</div>';
    }
    html += '<button style="margin-top:20px" id="btn-unlock-ok">确定</button></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('btn-unlock-ok').addEventListener('click', function(){
      document.getElementById('unlock-popup').remove();
    });
  }

  return { showVictory, showDeath };
})();

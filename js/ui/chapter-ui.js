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
  function showVictory() {
    const state = window.GameEngine.getState();
    const modeMultiplier = { mini: 0.5, short: 1.0, standard: 2.0 }[state.mode];
    const diffMultiplier = { easy: 0.7, normal: 1.0, hard: 1.5 }[state.difficulty];
    const deckSize = window.Deck.getDeckSize();
    const slimBonus = Math.max(0, (30 - deckSize) * 5);

    const baseScore = state.floor * 100 + state.enemiesDefeated * 10 + state.bossesDefeated * 200 + state.hp * 3 + state.relics.length * 15 + slimBonus;
    const totalScore = Math.floor(baseScore * modeMultiplier * diffMultiplier);

    // 解锁
    unlockCheck(state.class);
    // Increment win streak
    try {
      var streak = parseInt(localStorage.getItem('darkdungeon_streak') || '0') + 1;
      localStorage.setItem('darkdungeon_streak', '' + streak);
    } catch(e) {}

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay" style="animation:fadeIn 0.5s">
        <div class="overlay-content" style="max-width:400px;border-color:var(--gold);box-shadow:0 0 30px rgba(212,160,23,0.3)">
          <div style="font-size:48px;margin-bottom:8px">🏆</div>
          <h2 style="color:var(--gold);font-size:28px">胜利！</h2>
          <div style="font-size:36px;color:var(--gold);margin:12px 0">${totalScore} 分</div>
          <div style="text-align:left;margin:12px 0;font-size:14px">
            <div>职业：${state.class} | 模式：${state.mode} | 难度：${state.difficulty}</div>
            <div>到达层数：${state.floor} | 击杀敌人数：${state.enemiesDefeated}</div>
            <div>击败 BOSS：${state.bossesDefeated} | 遗物：${state.relics.length}</div>
            <div>牌组数量：${deckSize}</div>
          </div>
          <button id="btn-menu">返回主菜单</button>
        </div>
      </div>
    `;
    document.getElementById('btn-menu').addEventListener('click', () => {
      // Save best score
    try {
      var best = parseInt(localStorage.getItem('darkdungeon_bestscore') || '0');
      if (totalScore > best) localStorage.setItem('darkdungeon_bestscore', '' + totalScore);
    } catch(e) {}
    localStorage.removeItem('darkdungeon_save');
      document.body.classList.remove('death-vignette');
      window.Menu.show();
    });
  }

  function showDeath() {
    document.body.classList.add('death-vignette');
    try { var d=parseInt(localStorage.getItem('darkdungeon_deaths')||'0')+1; localStorage.setItem('darkdungeon_deaths',''+d); } catch(e){}
    const state = window.GameEngine.getState();
    let canRetry = false;
    try { canRetry = !!localStorage.getItem('darkdungeon_save'); } catch(e) {}
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay" style="animation:fadeIn 0.5s">
        <div class="overlay-content" style="border-color:var(--danger);box-shadow:0 0 30px rgba(231,76,60,0.3)">
          <div style="font-size:48px;margin-bottom:8px">💀</div>
          <h2 style="color:var(--danger);font-size:28px">战死</h2>
          <div style="text-align:left;margin:12px 0;font-size:14px">
            <div>职业：${state.class} | 到达层数：${state.floor}</div>
            <div>击杀敌人数：${state.enemiesDefeated} | 击败 BOSS：${state.bossesDefeated}</div>
            <div>牌组数量：${window.Deck.getDeckSize()}</div>
          </div>
          ${canRetry ? '<button id="btn-retry" class="btn-primary">重新挑战当前节点</button>' : ''}
          <button id="btn-menu" style="margin-top:8px">结束本局并返回主菜单</button>
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

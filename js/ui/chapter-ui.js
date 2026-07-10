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

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay">
        <div class="overlay-content" style="max-width:400px">
          <h2>胜利！</h2>
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
      localStorage.removeItem('darkdungeon_save');
      window.Menu.show();
    });
  }

  function showDeath() {
    const state = window.GameEngine.getState();
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay">
        <div class="overlay-content">
          <h2>你死了</h2>
          <div style="text-align:left;margin:12px 0;font-size:14px">
            <div>职业：${state.class} | 到达层数：${state.floor}</div>
            <div>击杀敌人数：${state.enemiesDefeated} | 击败 BOSS：${state.bossesDefeated}</div>
            <div>牌组数量：${window.Deck.getDeckSize()}</div>
          </div>
          <button id="btn-menu">返回主菜单</button>
        </div>
      </div>
    `;
    document.getElementById('btn-menu').addEventListener('click', () => {
      localStorage.removeItem('darkdungeon_save');
      window.Menu.show();
    });
  }

  function unlockCheck(cls) {
    try {
      let unlocks = JSON.parse(localStorage.getItem('darkdungeon_unlocks') || '{}');
      unlocks[cls] = true;
      localStorage.setItem('darkdungeon_unlocks', JSON.stringify(unlocks));
    } catch(e) {}
  }

  return { showVictory, showDeath };
})();

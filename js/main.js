// 暗黑地牢卡牌爬塔 — 主入口
// 事件路由和游戏流程控制

// 事件路由
    window.GameEngine.on('gameStart', (data) => {
      const state = window.GameEngine.getState();
      document.body.dataset.chapter = state.chapter;
      // 继续游戏：直接恢复保存的地图；新游戏：生成地图
      if (!state.map || state.map.length === 0) {
        const mapData = window.Map.generateFullMap(state.mode);
        state.map = mapData[0].nodes;
        state.currentNode = 0;
      }
      window.MapUI.show();
    });

    window.GameEngine.on('playerDeath', () => {
      window.ResultUI.showDeath();
    });

    window.GameEngine.on('enemyDefeated', () => {
      const state = window.GameEngine.getState();
      state.enemiesDefeated++;
    });

    // 战斗胜利处理
    window.GameEngine.on('battleVictory', () => { handleBattleVictory(); });
    
    // 战斗胜利检测

    async function handleBattleVictory() {
      const state = window.GameEngine.getState();
      const node = state.map[state.currentNode];
      
      window.Relic.triggerHook('onPostBattle', {});

      if (node.type === 'boss') {
        state.bossesDefeated++;
        state.defeatedBossIds.push(node.bossId);
        
        if (window.Map.isChapterEnd(node)) {
          const totalChapters = state.mode === 'mini' ? 1 : state.mode === 'short' ? 2 : 3;
          if (state.chapter >= totalChapters) {
            // 通关
            window.ResultUI.showVictory();
            return;
          }
          window.ChapterUI.showCleared(state.chapter);
          return;
        }
      }

      // 普通/精英战斗：选牌
      const pool = window.CARDS.filter(c => c.rarity === 'common' && c.type !== 'curse' && (c.class === state.class));
      const options = [];
      for (let i = 0; i < 3; i++) {
        options.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      const idx = await window.showPicker(options.map(c => ({label: `${c.name} (${c.cost}费)`})), {title: '战后选牌', allowSkip: true});
      if (idx >= 0) window.Deck.addCardToDeck(options[idx]);

      // 药水掉落 25%
      if (Math.random() < 0.25) {
        const potion = window.getRandomPotion('common');
        if (potion && state.potions.length < 3) state.potions.push(JSON.parse(JSON.stringify(potion)));
      }

        window.MapUI.show();
    }

    // 启动菜单
    window.Menu.show();

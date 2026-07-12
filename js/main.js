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
      state.deck = [...(state.deck || []), ...(state.hand || []), ...(state.discardPile || [])];
      state.hand = [];
      state.discardPile = [];
      window.Deck.shuffleDeck();
      
      window.Relic.triggerHook('onPostBattle', {});

      if (node.type === 'boss') {
        for (var fi=0;fi<3;fi++){setTimeout(function(){var bx=window.innerWidth*(0.2+Math.random()*0.6);var by=window.innerHeight*(0.2+Math.random()*0.4);for(var pi=0;pi<20;pi++){var p=document.createElement('div');p.style.cssText='position:fixed;left:'+bx+'px;top:'+by+'px;width:6px;height:6px;border-radius:50%;pointer-events:none;z-index:500;animation:fireworkBurst '+(0.6+Math.random()*0.4)+'s ease-out forwards';var a=Math.PI*2*pi/20;var d=40+Math.random()*60;p.style.setProperty('--dx',Math.cos(a)*d+'px');p.style.setProperty('--dy',Math.sin(a)*d+'px');p.style.background=['#d4a017','#e74c3c','#f39c12','#fff'][Math.floor(Math.random()*4)];document.body.appendChild(p);setTimeout(function(){p.remove();},1000);}},fi*200)}
        state.bossesDefeated++;
        state.defeatedBossIds.push(node.bossId);
        
        if (window.Map.isChapterEnd(node)) {
          window.Map.completeCurrentNode();
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
      const rewardCount = state.relics.some(r => r.effect && r.effect.cardChoice) ? 4 : 3;
      const options = [];
      for (let i = 0; i < rewardCount && pool.length > 0; i++) {
        options.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      if (options.length > 0) {
        const idx = await window.showPicker(options.map(c => ({label: `${c.name} (${c.cost}费)`})), {title: '战后选牌', allowSkip: true});
        if (idx >= 0) window.Deck.addCardToDeck(options[idx]);
      }

      // 药水掉落 25%
      const potionBonus = state.relics.reduce((sum, relic) => sum + ((relic.effect && relic.effect.potionDropBonus) || 0), 0);
      if (Math.random() < Math.min(1, 0.35 + potionBonus / 100)) {
        const potion = window.getRandomPotion('common');
        if (potion && state.potions.length < 3) state.potions.push(JSON.parse(JSON.stringify(potion)));
      }

        window.Map.completeCurrentNode();
        window.MapUI.show();
    }

    // 启动菜单
    window.Menu.show();

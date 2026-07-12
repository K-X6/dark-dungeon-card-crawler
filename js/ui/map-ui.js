// 暗黑地牢卡牌爬塔 — 地图UI
window.MapUI = (() => {
  function show() {
    const state = window.GameEngine.getState();
    const app = document.getElementById('app');
    const map = state.map;
    const currentNode = state.currentNode;

    const progressPct = Math.floor(((currentNode || 0) / Math.max(1, map.length - 1)) * 100);

    const nodeIcons = {
      battle: '⚔', elite: '💀', boss: '🐉',
      chest: '📦', shop: '💰', rest: '🔥',
      event: '❓', curse: '👿'
    };

    app.innerHTML = `
      <div class="map-container">
        <div class="map-header"><button id="btn-menu-return">← 菜单</button><div class="chapter-progress"><div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div></div>
          <div style="color:var(--text-dim);font-size:12px;margin-bottom:4px">牌组:${state.deck?state.deck.length:0}张 | 遗物:${state.relics?state.relics.length:0}个 | 药水:${state.potions?state.potions.length:0}瓶</div>
          <h2>第 ${state.chapter} 章</h2>
          <div class="chapter-name">${['','墓穴','深渊','王座之间'][state.chapter]}</div>
        </div>
        <div class="map-nodes">
          ${map.map((node, i) => {
            const nodeIcon = i < currentNode ? '✓' : (nodeIcons[node.type] || '?');
            let nodeClass = 'map-node';
            if (node.type === 'boss') nodeClass += ' node-boss';
            if (i === currentNode) nodeClass += ' current';
            else if (i < currentNode) nodeClass += ' visited';
            else if (i === currentNode + 1) nodeClass += ' available';
            else nodeClass += ' locked';
            return `
              <div class="${nodeClass}" data-index="${i}">
                <div class="node-icon">${nodeIcon}</div>
                <div class="node-info">
                  <div>第 ${node.floor} 层 - ${node.type}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('progress-fill').style.width = progressPct + '%';
    document.getElementById('btn-menu-return').addEventListener('click', function() { if (confirm('返回主菜单？进度已保存。')) { window.GameEngine.save(); window.Menu.show(); } });
    document.querySelectorAll('.map-node.available, .map-node.current').forEach(n => {
      n.addEventListener('click', async () => {
        const idx = parseInt(n.dataset.index);
        window.Map.advanceNode(idx);
        const node = map[idx];
        await handleNode(node);
      });
    });
  }

  async function handleNode(node) {
    const state = window.GameEngine.getState();
    switch (node.type) {
      case 'battle':
      case 'elite':
        startBattleNode(node);
        break;
      case 'boss':
        startBattleNode(node);
        break;
      case 'shop':
        window.EventUI.showShop();
        break;
      case 'rest':
        window.EventUI.showRest();
        break;
      case 'chest':
        await handleChest();
        show();
        break;
      case 'event':
        window.EventUI.showEvent();
        break;
      case 'curse':
        window.EventUI.showCurseEvent();
        break;
    }
  }

  function startBattleNode(node) {
    const state = window.GameEngine.getState();
    const diffIdx = { easy: 0, normal: 1, hard: 2 }[state.difficulty];
    let enemies;

    if (node.type === 'boss') {
      const bossData = window.ENEMIES['chapter' + state.chapter].boss.find(b => b.name === node.bossId);
      enemies = [{
        name: bossData.name, hp: bossData.hp[diffIdx], maxHp: bossData.hp[diffIdx],
        damage: bossData.damage[diffIdx], intents: bossData.intents,
        poison: 0, burn: 0, effects: {}
      }];
    } else if (node.type === 'elite') {
      const elitePool = window.ENEMIES['chapter' + state.chapter].elite;
      const elite = elitePool[Math.floor(Math.random() * elitePool.length)];
      enemies = [{
        name: elite.name, hp: elite.hp[diffIdx], maxHp: elite.hp[diffIdx],
        damage: elite.damage[diffIdx], intents: elite.intents,
        poison: 0, burn: 0, effects: {}
      }];
      // Add hard variation for hard mode
      if (state.difficulty === 'hard' && elite.hardVariations?.length) {
        const variation = elite.hardVariations[Math.floor(Math.random() * elite.hardVariations.length)];
        if (variation.effect.damageMultiplier) enemies[0].damage = Math.floor(enemies[0].damage * variation.effect.damageMultiplier);
      }
    } else {
    const pool = window.ENEMIES['chapter' + state.chapter].normal;
    const count = Math.random() < 0.6 ? 2 : 1; // 60% chance of 2 enemies
    enemies = [];
    const usedNames = [];
    for (let ci = 0; ci < count; ci++) {
      let enemy;
      let attempts = 0;
      // Try to avoid duplicate enemy types
      do {
        enemy = pool[Math.floor(Math.random() * pool.length)];
        attempts++;
      } while (usedNames.includes(enemy.name) && attempts < 10 && pool.length > 1);
      usedNames.push(enemy.name);
      const e = {
        name: enemy.name, hp: (state.difficulty==='hard'?Math.floor(enemy.hp[diffIdx]*0.95):enemy.hp[diffIdx]), maxHp: (state.difficulty==='hard'?Math.floor(enemy.hp[diffIdx]*0.95):enemy.hp[diffIdx]),
        damage: enemy.damage[diffIdx], intents: (enemy.altIntents && Math.random()<0.5 ? enemy.altIntents : enemy.intents).slice(),
        poison: 0, burn: 0, effects: {}
      };
      if (state.difficulty === 'hard' && enemy.hardVariations && enemy.hardVariations.length > 0) {
        const variation = enemy.hardVariations[Math.floor(Math.random() * enemy.hardVariations.length)];
        applyVariation(e, variation);
      }
      enemies.push(e);
    }
      if (state.difficulty === 'hard' && enemy.hardVariations?.length) {
        const variation = enemy.hardVariations[Math.floor(Math.random() * enemy.hardVariations.length)];
        if (variation.effect.damageMultiplier) enemies[0].damage = Math.floor(enemies[0].damage * variation.effect.damageMultiplier);
      }
    }

    var nodeTypeName = node.type;
    if (nodeTypeName === 'elite' || nodeTypeName === 'boss') {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:500';
      var label = nodeTypeName === 'boss' ? '👉 BOSS战' : '💀 精英战';
      var nameHtml = nodeTypeName === 'boss' ? (node.bossId || '') : '';
      overlay.innerHTML = '<div style="color:var(--accent);font-size:36px;text-shadow:0 0 20px var(--accent);text-align:center">' + label + '</div>' +
        (nameHtml ? '<div style="color:var(--danger);font-size:24px;margin-top:12px">' + nameHtml + '</div>' : '') +
        '<div style="color:var(--text-dim);font-size:14px;margin-top:20px">点击任意处开始</div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function() {
        overlay.remove();
        window.Combat.startBattle(enemies);
        window.BattleUI.show();
      });
      return;
    }
    window.Combat.startBattle(enemies);
    window.BattleUI.show();
  }

  async function handleChest() {
    const state = window.GameEngine.getState();
    const roll = Math.random();
    if (roll < 0.6) { // 60% relic
      const rarity = Math.random() < 0.7 ? 'common' : 'rare';
      const pool = window.RELICS[rarity];
      const relic = pool[Math.floor(Math.random() * pool.length)];
      state.relics.push(JSON.parse(JSON.stringify(relic)));
      var t2=document.createElement('div');t2.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--surface);border:2px solid var(--gold);color:var(--gold);padding:8px 20px;border-radius:8px;z-index:500;font-size:14px;animation:toastIn 2.5s ease forwards';t2.textContent='获得遗物: '+relic.name;document.body.appendChild(t2);setTimeout(function(){t2.remove();},2600);
    } else { // 40% potion
      const potion = window.POTIONS[Math.floor(Math.random() * window.POTIONS.length)];
      if (state.potions.length < 3) state.potions.push(JSON.parse(JSON.stringify(potion)));
    }
  }

  return { show, handleNode };
})();





// 暗黑地牢卡牌爬塔 — 地图UI
window.MapUI = (() => {
  function show() {
    const state = window.GameEngine.getState();
    const app = document.getElementById('app');
    const map = state.map;
    const currentNode = state.currentNode;

    const nodeIcons = {
      battle: '⚔', elite: '💀', boss: '🐉',
      chest: '📦', shop: '💰', rest: '🔥',
      event: '❓', curse: '👿'
    };

    app.innerHTML = `
      <div class="map-container">
        <div class="map-header">
          <h2>第 ${state.chapter} 章</h2>
          <div class="chapter-name">${['','墓穴','深渊','王座之间'][state.chapter]}</div>
        </div>
        <div class="map-nodes">
          ${map.map((node, i) => {
            let nodeClass = 'map-node';
            if (node.type === 'boss') nodeClass += ' node-boss';
            if (i === currentNode) nodeClass += ' current';
            else if (i < currentNode) nodeClass += ' visited';
            else if (i === currentNode + 1) nodeClass += ' available';
            return `
              <div class="${nodeClass}" data-index="${i}">
                <div class="node-icon">${nodeIcons[node.type] || '?'}</div>
                <div class="node-info">
                  <div>第 ${node.floor} 层 - ${node.type}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

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
      const enemy = pool[Math.floor(Math.random() * pool.length)];
      enemies = [{
        name: enemy.name, hp: enemy.hp[diffIdx], maxHp: enemy.hp[diffIdx],
        damage: enemy.damage[diffIdx], intents: enemy.intents,
        poison: 0, burn: 0, effects: {}
      }];
      if (state.difficulty === 'hard' && enemy.hardVariations?.length) {
        const variation = enemy.hardVariations[Math.floor(Math.random() * enemy.hardVariations.length)];
        if (variation.effect.damageMultiplier) enemies[0].damage = Math.floor(enemies[0].damage * variation.effect.damageMultiplier);
      }
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
    } else { // 40% potion
      const potion = window.POTIONS[Math.floor(Math.random() * window.POTIONS.length)];
      if (state.potions.length < 3) state.potions.push(JSON.parse(JSON.stringify(potion)));
    }
  }

  return { show, handleNode };
})();


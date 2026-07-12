// 暗黑地牢卡牌爬塔 — 事件/商店/休息UI
window.EventUI = (() => {
  async function showEvent() {
    const state = window.GameEngine.getState();
    const available = window.EVENTS.filter(e => !state.eventsEncountered.includes(e.name));
    if (available.length === 0) { window.MapUI.show(); return; }
    const event = available[Math.floor(Math.random() * available.length)];
    state.eventsEncountered.push(event.name);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay">
        <div class="overlay-content">
          <h2>${event.name}</h2>
          <p style="margin:12px 0;color:var(--text-dim)">${event.description}</p>
          <div class="picker-options">
            ${event.options.map((opt, i) => `
              <button data-opt="${i}">${opt.text}</button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('[data-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const effects = event.options[parseInt(btn.dataset.opt)].effects;
        executeEventEffects(effects);
        window.MapUI.show();
      });
    });
  }

  function executeEventEffects(effects) {
    const state = window.GameEngine.getState();
    for (const eff of effects) {
      switch (eff.type) {
        case 'heal': state.hp = Math.min(state.maxHp, state.hp + eff.value); break;
        case 'loseHpFlat': state.hp = Math.max(1, state.hp - eff.value); break;
        case 'loseHpPercent': state.hp = Math.max(1, state.hp - Math.floor(state.maxHp * eff.percent / 100)); break;
        case 'gainRelic': {
          const pool = window.RELICS[eff.rarity === 'random' ? (Math.random() < 0.7 ? 'common' : 'rare') : eff.rarity];
          if (pool?.length) state.relics.push(JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)])));
          break;
        }
        case 'gainRelicChoice': { /* handled by showPicker in game flow */ break; }
        case 'gainCard': {
          const rarity = eff.rarity || 'common';
          const pool = window.CARDS.filter(c => c.rarity === rarity && c.type !== 'curse');
          if (pool.length) window.Deck.addCardToDeck(pool[Math.floor(Math.random() * pool.length)]);
          break;
        }
        case 'gainPotion': {
          if (state.potions.length >= 3) break;
          const p = window.getRandomPotion(eff.rarity);
          if (p) state.potions.push(JSON.parse(JSON.stringify(p)));
          break;
        }
        case 'gainCurse': {
          for (let i = 0; i < (eff.count || 1); i++) {
            const curse = window.CARDS.find(c => c.type === 'curse');
            if (curse) state.hand.push(JSON.parse(JSON.stringify(curse)));
          }
          break;
        }
        case 'upgradeCard': { /* handled by rest UI */ break; }
        case 'removeCard': { /* handled by rest UI */ break; }
        case 'losePotion': {
          if (state.potions.length > 0) state.potions.splice(0, eff.count || 1);
          break;
        }
        case 'loseRelic': {
          if (state.relics.length > 0) {
            const idx = Math.floor(Math.random() * state.relics.length);
            state.relics.splice(idx, 1);
          }
          break;
        }
        case 'gamble': {
          if (Math.random() * 100 < eff.chance) executeEventEffects([eff.win]);
          else if (eff.lose) executeEventEffects([eff.lose]);
          break;
        }
      }
    }
  }

  async function showShop() {
    const state = window.GameEngine.getState();
    window.Relic.triggerHook('onEnterShop', {});

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay">
        <div class="overlay-content" style="max-width:360px">
          <h2>💰 商店</h2>
          <p style="color:var(--text-dim);font-size:13px;margin-bottom:12px">以血换物 — 当前 HP: ${state.hp}</p>
          <div class="picker-options" style="gap:6px">
            <button id="shop-card" ${state.hp < 15 ? "disabled" : ""}>普通卡牌 — 15 HP${state.hp < 15 ? " (HP不足)" : ""}</button>
            <button id="shop-rare" ${state.hp < 30 ? "disabled" : ""}>稀有卡牌 — 30 HP${state.hp < 30 ? " (HP不足)" : ""}</button>
            <button id="shop-potion" ${state.hp < 10 ? "disabled" : ""}>药水 — 10 HP${state.hp < 10 ? " (HP不足)" : ""}</button>
            <button id="shop-relic" ${state.hp < 40 ? "disabled" : ""}>普通遗物 — 40 HP${state.hp < 40 ? " (HP不足)" : ""}</button>
            <button id="shop-rare-relic" ${state.hp < 60 ? "disabled" : ""}>稀有遗物 — 60 HP${state.hp < 60 ? " (HP不足)" : ""}</button>
            <button id="shop-remove" ${state.hp < 25 || window.Deck.getDeckSize() <= 5 ? "disabled" : ""}>移除一张牌 — 25 HP${state.hp < 25 ? " (HP不足)" : window.Deck.getDeckSize() <= 5 ? " (牌组最小5张)" : ""}</button>
            <button id="shop-leave" style="margin-top:8px">➕ 离开商店</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('shop-card').addEventListener('click', () => shopBuy(15, 'card', 'common'));
    document.getElementById('shop-rare').addEventListener('click', () => shopBuy(30, 'card', 'rare'));
    document.getElementById('shop-potion').addEventListener('click', () => shopBuy(10, 'potion'));
    document.getElementById('shop-relic').addEventListener('click', () => shopBuy(40, 'relic', 'common'));
    document.getElementById('shop-rare-relic').addEventListener('click', () => shopBuy(60, 'relic', 'rare'));
    document.getElementById('shop-remove').addEventListener('click', async () => {
      if (state.hp < 25 || window.Deck.getDeckSize() <= 5) return;
      state.hp -= 25;
      const allCards = [...state.deck, ...state.discardPile];
      const idx = await window.showPicker(allCards.map(c => ({label: c.name})), {title: '选择要移除的牌', allowSkip: true});
      if (idx >= 0) {
        // Remove from the combined pool
        allCards.splice(idx, 1);
        state.deck = allCards;
        state.discardPile = [];
      }
      window.MapUI.show();
    });
    document.getElementById('shop-leave').addEventListener('click', () => window.MapUI.show());
  }

  async function shopBuy(cost, type, rarity) {
    const state = window.GameEngine.getState();
    if (state.hp < cost) return;
    state.hp -= cost;
    if (type === 'card') {
      const pool = window.CARDS.filter(c => c.rarity === rarity && c.type !== 'curse' && (c.class === state.class || c.class === 'curse'));
      if (pool.length === 0) return;
      const options = [];
      for (let i = 0; i < 3; i++) options.push(pool[Math.floor(Math.random() * pool.length)]);
      const idx = await window.showPicker(options.map(c => ({label: `${c.name} (${c.cost}费)`})), {title: '选择一张牌', allowSkip: true});
      if (idx >= 0) window.Deck.addCardToDeck(options[idx]);
    } else if (type === 'relic') {
      const pool = window.RELICS[rarity];
      const relic = pool[Math.floor(Math.random() * pool.length)];
      state.relics.push(JSON.parse(JSON.stringify(relic)));
    } else if (type === 'potion') {
      if (state.potions.length >= 3) return;
      const p = window.getRandomPotion('common');
      if (p) state.potions.push(JSON.parse(JSON.stringify(p)));
    }
    window.MapUI.show();
  }

  async function showRest() {
    const state = window.GameEngine.getState();
    const allCards = [...state.deck, ...state.hand, ...state.discardPile];
    const upgradable = allCards.filter(c => !c._upgraded && c.upgraded && c.upgraded.effects);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="overlay">
        <div class="overlay-content">
          <h2>休息点</h2>
          <div class="picker-options">
            <button id="rest-heal">回复 30% HP</button>
            <button id="rest-upgrade" ${upgradable.length === 0 ? 'disabled' : ''}>升级一张牌</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('rest-heal').addEventListener('click', () => {
      state.hp = Math.min(state.maxHp, state.hp + Math.ceil(state.maxHp * 0.3));
      window.Relic.triggerHook('onEnterRest', {});
      window.MapUI.show();
    });

    document.getElementById('rest-upgrade').addEventListener('click', async () => {
      if (upgradable.length === 0) return;
      const idx = await window.showPicker(upgradable.map(c => ({label: c.name})), {title: '选择升级', allowSkip: false});
      if (idx >= 0) {
        const card = upgradable[idx];
        card._upgraded = true;
        card.effects = JSON.parse(JSON.stringify(card.upgraded.effects));
        if (card.upgraded.upgradedCost !== undefined) card.cost = card.upgraded.upgradedCost;
      }
      window.MapUI.show();
    });
  }

  function showCurseEvent() {
    const state = window.GameEngine.getState();
    const rareRelics = window.RELICS.rare;
    const relic = rareRelics[Math.floor(Math.random() * rareRelics.length)];
    state.relics.push(JSON.parse(JSON.stringify(relic)));
    const curse = window.CARDS.filter(c => c.type === 'curse')[Math.floor(Math.random() * 5)];
    state.hand.push(JSON.parse(JSON.stringify(curse)));
    window.MapUI.show();
  }

  return { showEvent, showShop, showRest, showCurseEvent, executeEventEffects };
})();


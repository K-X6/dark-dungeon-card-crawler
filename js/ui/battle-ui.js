// 暗黑地牢卡牌爬塔 — 战斗UI
window.BattleUI = (() => {
  let selectedCardIndex = null;

  function show() {
    const state = window.GameEngine.getState();
    const app = document.getElementById('app');
    render(state);
    showMulligan(state);
  }

  function render(state) {
    const app = document.getElementById('app');
    const enemies = window.Combat.getEnemies();
    const phase = window.Combat.getPhase();

    app.innerHTML = `
      <div class="battle-container">
        <div class="battle-top">
          <div class="player-stats">
            <div class="stat"><span class="hp-value">❤ ${state.hp}/${state.maxHp}</span></div>
            <div class="stat"><span class="armor-value">🛡 ${state.armor}</span></div>
            <div class="stat"><span class="energy-value">⚡ ${state.energy}/${state.maxEnergy}</span></div>
            ${state.strength > 0 ? `<div class="stat">💪 ${state.strength}</div>` : ''}
          </div>
        </div>

        <div class="enemy-area">
          ${enemies.map((e, i) => `
            <div class="enemy-card ${e.hp <= 0 ? 'hidden' : ''}" data-enemy="${i}" id="enemy-${i}">
              <h3>${e.name}</h3>
              <div>HP ${e.hp}/${e.maxHp}</div>
              <div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:${e.hp/e.maxHp*100}%"></div></div>
              ${e.poison > 0 ? `<div style="color:#2ecc71">☠ ${e.poison}</div>` : ''}
              ${e.burn > 0 ? `<div style="color:#e67e22">🔥 ${e.burn}</div>` : ''}
              <div class="enemy-intent">
                <span class="intent-icon">${getIntentIcon(e)}</span>
                ${getIntentText(e)}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="hand-area" id="hand-area">
          ${state.hand.map((c, i) => renderCard(c, i, state)).join('')}
        </div>

        <div class="battle-controls">
          <div class="potion-bar">
            ${Array.from({length: state.relics.find(r => r.effect?.potionSlots) ? 4 : 3}).map((_, i) => `
              <div class="potion-slot ${state.potions[i] ? 'filled' : 'empty'}" data-potion="${i}">
                ${state.potions[i] ? '🧪' : ''}
              </div>
            `).join('')}
          </div>
          <button id="btn-end-turn" ${phase !== 'PLAYER_TURN' ? 'disabled' : ''}>结束回合</button>
        </div>
      </div>
    `;

    // Click handlers
    document.querySelectorAll('.card:not(.curse):not(.disabled)').forEach(cardEl => {
      cardEl.addEventListener('click', () => {
        const idx = parseInt(cardEl.dataset.index);
        const card = state.hand[idx];
        const cost = window.Deck.getCardCost(card);
        if (state.energy < cost) return;
        selectedCardIndex = idx;
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        cardEl.classList.add('selected');
      });
    });

    document.querySelectorAll('.enemy-card').forEach(enemyEl => {
      enemyEl.addEventListener('click', () => {
        if (selectedCardIndex === null) return;
        const enemyIdx = parseInt(enemyEl.dataset.enemy);
        window.Combat.playCard(selectedCardIndex, enemyIdx);
        selectedCardIndex = null;
        refresh();
      });
    });

    document.querySelectorAll('.potion-slot.filled').forEach(slot => {
      slot.addEventListener('click', () => {
        const idx = parseInt(slot.dataset.potion);
        const potion = state.potions[idx];
        if (potion && potion.effect) {
          window.Combat.executeEffect(potion.effect);
          state.potions.splice(idx, 1);
          window.GameEngine.emit('potionUsed', { potion });
          refresh();
        }
      });
    });

    document.getElementById('btn-end-turn').addEventListener('click', () => {
      window.Combat.endPlayerTurn();
      refresh();
    });
  }

  function renderCard(card, index, state) {
    const cost = window.Deck.getCardCost(card);
    const canPlay = state.energy >= cost && card.type !== 'curse';
    const cls = card.type === 'curse' ? 'card curse' : canPlay ? 'card' : 'card disabled';
    return `
      <div class="${cls}" data-index="${index}">
        <div class="card-cost">${cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-type">${card.type}</div>
        <div class="card-effects">${describeEffects(card.effects)}</div>
      </div>
    `;
  }

  function describeEffects(effects) {
    if (!effects) return '';
    return effects.map(e => {
      if (e.type === 'damage') return `⚔${e.value}`;
      if (e.type === 'aoeDamage') return `💥${e.value}`;
      if (e.type === 'armor') return `🛡${e.value}`;
      if (e.type === 'poison') return `☠${e.layers}`;
      if (e.type === 'draw') return `📜${e.count}`;
      if (e.type === 'strength') return `💪${e.value}`;
      return '';
    }).join(' ');
  }

  function getIntentIcon(enemy) {
    const intent = enemy.intents?.[enemy.intentIndex % enemy.intents.length] || '';
    if (intent.startsWith('attack')) return '⚔';
    if (intent.startsWith('defend')) return '🛡';
    if (intent.startsWith('strengthen')) return '⬆';
    if (intent.startsWith('summon')) return '💀';
    return '❓';
  }

  function getIntentText(enemy) {
    const intent = enemy.intents?.[enemy.intentIndex % enemy.intents.length] || '';
    const dmg = enemy.damage;
    if (intent === 'attack') return '\u4F24\u5BB3 ' + dmg;
    if (intent.startsWith('defend')) return '\u9632\u5FA1';
    if (intent.startsWith('strengthen')) return '\u5F3A\u5316';
    if (intent === 'summon') return '\u53EC\u5524';
    if (intent.startsWith('heal')) return '\u56DE\u590D';
    if (intent.startsWith('apply') || intent.startsWith('aoePoison')) return '\u6CD5\u672F';
    if (intent === 'charge') return '\u84C4\u529B';
    if (intent === 'ultimate') return '\u5FC5\u6740\u6280';
    if (intent === 'aoe') return '\u5168\u4F53\u653B\u51FB';
    if (intent === 'lifestealAttack') return '\u5438\u8840 ' + dmg;
    return intent;
  }

  function showMulligan(state) {
    const overlay = document.createElement('div');
    overlay.id = 'mulligan-overlay';
    overlay.innerHTML = `
      <h2 style="color:var(--accent)">起始手牌</h2>
      <div style="display:flex;gap:10px">
        ${state.hand.map(c => `
          <div class="card"><div class="card-name">${c.name}</div><div class="card-cost">${c.cost}</div></div>
        `).join('')}
      </div>
      <button id="btn-keep">开始战斗</button>
      <button id="btn-mulligan">换牌</button>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-keep').addEventListener('click', () => { overlay.remove(); });
    document.getElementById('btn-mulligan').addEventListener('click', () => {
      const st = window.GameEngine.getState();
      st.discardPile.push(...st.hand);
      st.hand = [];
      window.Deck.drawCards(3);
      overlay.remove();
      render(st);
    });
  }

  function refresh() {
    render(window.GameEngine.getState());
  }

  return { show, refresh };
})();


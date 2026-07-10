// 暗黑地牢卡牌爬塔 — 战斗UI (含动画+描述)
window.BattleUI = (() => {
  let selectedCardIndex = null;

  function show() {
    const state = window.GameEngine.getState();
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
            <div class="enemy-card ${e.hp <= 0 ? 'dying' : ''}" data-enemy="${i}" id="enemy-${i}">
              <h3>${e.name}${e.variation ? ' ['+e.variation+']' : ''}</h3>
              <div>HP ${e.hp}/${e.maxHp}</div>
              <div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:${Math.max(0,e.hp/e.maxHp*100)}%"></div></div>
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

    document.querySelectorAll('.enemy-card:not(.dying)').forEach(enemyEl => {
      enemyEl.addEventListener('click', () => {
        if (selectedCardIndex === null) return;
        const enemyIdx = parseInt(enemyEl.dataset.enemy);
        const cardEl = document.querySelector('.card.selected');
        if (cardEl) cardEl.classList.add('played');
        const energyEl = document.querySelector('.energy-value');
        if (energyEl) { energyEl.classList.add('pulse'); setTimeout(() => energyEl.classList.remove('pulse'), 300); }
        window.Combat.playCard(selectedCardIndex, enemyIdx);
        if (enemyEl) {
          const rect = enemyEl.getBoundingClientRect();
          const card = window.GameEngine.getState().hand[selectedCardIndex];
          if (card && card.effects) {
            const dmgEff = card.effects.find(e => e.type === 'damage' || e.type === 'aoeDamage');
            if (dmgEff) showFloatText(rect.left + rect.width/2, rect.top, '-'+window.Combat.calcDamage(dmgEff.value), 'damage');
          }
          enemyEl.classList.add('hit');
          setTimeout(() => enemyEl.classList.remove('hit'), 300);
        }
        selectedCardIndex = null;
        setTimeout(() => refresh(), 200);
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
    const desc = describeCard(card);
    return `
      <div class="${cls}" data-index="${index}" title="${desc}">
        <div class="card-cost">${cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-type">${card.type}</div>
        <div class="card-effects">${describeEffects(card.effects)}</div>
      </div>
    `;
  }

  function describeEffects(effects) {
    if (!effects) return '';
    const labels = [];
    for (const e of effects) {
      if (e.type === 'damage') labels.push('⚔'+e.value);
      else if (e.type === 'aoeDamage') labels.push('💥'+e.value);
      else if (e.type === 'armor') labels.push('🛡'+e.value);
      else if (e.type === 'poison' || e.type === 'aoePoison') labels.push('☠'+(e.layers||''));
      else if (e.type === 'burn') labels.push('🔥'+(e.layers||''));
      else if (e.type === 'draw') labels.push('📜'+e.count);
      else if (e.type === 'strength') labels.push('💪'+e.value);
      else if (e.type === 'weak') labels.push('💤'+(e.turns||''));
      else if (e.type === 'stun') labels.push('⏸');
      else if (e.type === 'chain') labels.push('⚡'+e.value);
      else if (e.type === 'retainArmor') labels.push('🔒');
      else if (e.type === 'nextTurnEnergy') labels.push('⏳+'+e.value);
      else if (e.type === 'poisonDamage') labels.push('☠x'+(e.multiplier||2));
      else if (e.type === 'execute') labels.push('🗡');
      else if (e.type === 'bonusOnPoison') labels.push('☠+'+e.value);
      else if (e.type === 'perPoisonDamage') labels.push('☠x'+e.value);
    }
    return labels.join(' ');
  }

  function describeCard(card) {
    if (!card.effects) return '';
    const parts = [];
    for (const e of card.effects) {
      if (e.type === 'damage') parts.push('造成 '+e.value+' 伤害');
      else if (e.type === 'aoeDamage') parts.push('全体 '+e.value+' 伤害');
      else if (e.type === 'armor') parts.push('获得 '+e.value+' 护甲');
      else if (e.type === 'poison') parts.push('施加 '+e.layers+' 层中毒');
      else if (e.type === 'burn') parts.push('施加 '+e.layers+' 层灼烧');
      else if (e.type === 'draw') parts.push('抽 '+e.count+' 张牌');
      else if (e.type === 'strength') parts.push('力量 +'+e.value);
      else if (e.type === 'weak') parts.push('虚弱 '+(e.turns||1)+' 回合');
      else if (e.type === 'stun') parts.push('眩晕敌人');
      else if (e.type === 'energy') parts.push('能量 +'+e.value);
      else if (e.type === 'heal') parts.push('回复 '+e.value+' HP');
      else if (e.type === 'chain') parts.push('弹射 '+e.value);
      else if (e.type === 'retainArmor') parts.push('护甲保留');
      else if (e.type === 'nextTurnEnergy') parts.push('下回合 +'+e.value+'能量');
      else if (e.type === 'extraTurn') parts.push('额外一个回合');
      else if (e.type === 'execute') parts.push('HP<50%时 '+e.value+'伤害');
      else if (e.type === 'duplicate') parts.push('复制一张0费版');
    }
    return parts.join('，');
  }

  function getIntentIcon(enemy) {
    const intent = enemy.intents?.[enemy.intentIndex % enemy.intents.length] || '';
    if (intent.startsWith('attack') || intent === 'lifestealAttack') return '⚔';
    if (intent.startsWith('defend')) return '🛡';
    if (intent.startsWith('strengthen')) return '⬆';
    if (intent === 'summon') return '💀';
    if (intent.startsWith('heal')) return '❤';
    if (intent.startsWith('apply') || intent.startsWith('aoePoison')) return '🔮';
    if (intent === 'charge') return '⚡';
    if (intent === 'ultimate') return '☠';
    if (intent === 'aoe') return '💥';
    return '❓';
  }

  function getIntentText(enemy) {
    const intent = enemy.intents?.[enemy.intentIndex % enemy.intents.length] || '';
    const dmg = enemy.damage;
    if (intent === 'attack') return '伤害 ' + dmg;
    if (intent.startsWith('defend')) return '防御';
    if (intent.startsWith('strengthen')) return '强化';
    if (intent === 'summon') return '召唤';
    if (intent.startsWith('heal')) return '回复';
    if (intent.startsWith('apply') || intent.startsWith('aoePoison')) return '法术';
    if (intent === 'charge') return '蓄力';
    if (intent === 'ultimate') return '必杀技';
    if (intent === 'aoe') return '全体攻击';
    if (intent === 'lifestealAttack') return '吸血 ' + dmg;
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
    document.getElementById('btn-keep').addEventListener('click', () => overlay.remove());
    document.getElementById('btn-mulligan').addEventListener('click', () => {
      const st = window.GameEngine.getState();
      st.discardPile.push(...st.hand);
      st.hand = [];
      window.Deck.drawCards(3);
      overlay.remove();
      render(st);
    });
  }

  function showFloatText(x, y, text, cls) {
    const el = document.createElement('div');
    el.className = 'float-text ' + (cls || 'damage');
    el.textContent = text;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function refresh() { render(window.GameEngine.getState()); }

  return { show, refresh };
})();

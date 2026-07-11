window.BattleUI = (function() {
  var selectedCardIndex = null;

  function show() {
    render(window.GameEngine.getState());
    showMulligan(window.GameEngine.getState());
  }

  function render(state) {
    var app = document.getElementById('app');
    var enemies = window.Combat.getEnemies();
    var phase = window.Combat.getPhase();

    var html = '<div class="battle-container">';
    html += '<div class="battle-top"><div class="player-stats">';
    html += '<div class="stat"><span class="hp-value">❤ ' + state.hp + '/' + state.maxHp + '</span></div>';
    html += '<div class="stat"><span class="armor-value">🛡 ' + state.armor + '</span></div>';
    html += '<div class="stat"><span class="energy-value">⚡ ' + state.energy + '/' + state.maxEnergy + '</span></div>';
    if (state.strength > 0) html += '<div class="stat">💪 ' + state.strength + '</div>';
    html += '</div></div>';
    html += '<div class="enemy-area">';
    for (var ei = 0; ei < enemies.length; ei++) {
      var e = enemies[ei];
      var sh = e._shield > 0 ? ' (🛡' + e._shield + ')' : '';
      var vr = e.variation ? ' [' + e.variation + ']' : '';
      var dc = e.hp <= 0 ? ' dying' : '';
      html += '<div class="enemy-card' + dc + '" data-enemy="' + ei + '" id="enemy-' + ei + '">';
      html += '<h3>' + e.name + vr + '</h3>';
      html += '<div>HP ' + e.hp + '/' + e.maxHp + sh + '</div>';
      html += '<div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:' + Math.max(0, e.hp/e.maxHp*100) + '%"></div></div>';
      if (e.poison > 0) html += '<div style="color:#2ecc71">☠ ' + e.poison + '</div>';
      if (e.burn > 0) html += '<div style="color:#e67e22">🔥 ' + e.burn + '</div>';
      html += '<div class="enemy-intent"><span class="intent-icon">' + getIntentIcon(e) + '</span> ' + getIntentText(e) + '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="hand-area" id="hand-area">';
    for (var hi = 0; hi < state.hand.length; hi++) {
      html += renderCard(state.hand[hi], hi, state);
    }
    html += '</div>';
    html += '<div class="battle-controls">';
    html += '<div class="potion-bar">';
    var maxSlots = (state.relics.find(function(r){return r.effect&&r.effect.potionSlots;}) ? 4 : 3);
    for (var pi = 0; pi < maxSlots; pi++) {
      html += '<div class="potion-slot ' + (state.potions[pi] ? 'filled' : 'empty') + '" data-potion="' + pi + '" title="' + (state.potions[pi] ? state.potions[pi].name + ': ' + state.potions[pi].description : '') + '">';
      html += state.potions[pi] ? '🧪' : '';
      html += '</div>';
    }
    html += '</div>';
    html += '<div id="enemy-action-log" style="text-align:center;color:var(--text-dim);font-size:14px;min-height:20px;margin:4px 0"></div>';
  html += '<button id="btn-end-turn"' + (phase !== 'PLAYER_TURN' ? ' disabled' : '') + '>结束回合</button>';
    html += '</div></div>';
    app.innerHTML = html;

    bindCardClicks(state);
    bindEnemyClicks();
    bindPotionClicks(state);
    document.getElementById('btn-end-turn').addEventListener('click', function() {
      var enemies = window.Combat.getEnemies();
      var logLines = [];
      for (var ei2 = 0; ei2 < enemies.length; ei2++) {
        var e = enemies[ei2];
        if (e.hp <= 0) continue;
        var intent = (e.intents && e.intents[e.intentIndex % e.intents.length]) || '';
        var base = intent.split('(')[0];
        if (base === 'attack') logLines.push(e.name + ' 攻击造成 ' + e.damage + ' 伤害');
        else if (base === 'lifestealAttack') logLines.push(e.name + ' 吸血攻击造成 ' + e.damage + ' 伤害');
        else if (base === 'defend') logLines.push(e.name + ' 获得护盾');
        else if (base === 'strengthen' || base === 'strengthenAll') logLines.push(e.name + ' 攻击力上升');
        else if (base === 'applyWeak') logLines.push(e.name + ' 使你虚弱');
        else if (base === 'applyFrail') logLines.push(e.name + ' 使你脆弱');
        else if (base === 'applyCurse') logLines.push(e.name + ' 将诅咒牌塞入你手牌');
        else if (base === 'aoePoison') logLines.push(e.name + ' 释放毒雾');
        else if (base === 'aoe') logLines.push(e.name + ' 全体攻击');
        else if (base === 'heal') logLines.push(e.name + ' 回复生命');
        else if (base === 'summon') logLines.push(e.name + ' 召唤援军');
        else if (base === 'charge') logLines.push(e.name + ' 正在蓄力...');
        else if (base === 'ultimate') logLines.push(e.name + ' 释放必杀技!');
        else if (intent.indexOf('defend') === 0) logLines.push(e.name + ' 防御');
        else if (intent.indexOf('strengthen') === 0) logLines.push(e.name + ' 强化');
        else logLines.push(e.name + ' ' + getIntentText(e));
      }
      window.Combat.endPlayerTurn();
      var enemiesAfter = window.Combat.getEnemies();
      if (enemiesAfter.every(function(e){return e.hp<=0;})) sfxVictory();
      else if (window.GameEngine.getState().hp > 0) sfxTurnEnd();
      var logEl = document.getElementById('enemy-action-log');
      if (logEl && logLines.length > 0) {
        logEl.textContent = logLines.join(' | ');
        setTimeout(function() { if (logEl) logEl.textContent = ''; }, 3000);
      }
      refresh();
    });
  }

  function bindCardClicks(state) {
    var cards = document.querySelectorAll('.card:not(.curse):not(.disabled)');
    for (var i = 0; i < cards.length; i++) {
      (function(el, idx) {
        el.addEventListener('click', function() {
          var cost = window.Deck.getCardCost(state.hand[idx]);
          if (state.energy < cost) return;
          selectedCardIndex = idx;
          document.querySelectorAll('.card').forEach(function(c){c.classList.remove('selected');});
          el.classList.add('selected');
          document.querySelectorAll('.enemy-card:not(.dying)').forEach(function(e){e.classList.add('targetable');});
        });
      })(cards[i], parseInt(cards[i].dataset.index));
    }
  }

  function bindEnemyClicks() {
    var enemies = document.querySelectorAll('.enemy-card:not(.dying)');
    for (var i = 0; i < enemies.length; i++) {
      (function(enemyEl, idx) {
        enemyEl.addEventListener('click', function() {
          if (selectedCardIndex === null) return;
          document.querySelectorAll('.enemy-card.targetable').forEach(function(e){e.classList.remove('targetable');});
          var cardEl = document.querySelector('.card.selected');
          if (cardEl) {
            var cr = cardEl.getBoundingClientRect();
            var er = enemyEl.getBoundingClientRect();
            createProjectile(cardEl.querySelector('.card-name').textContent, cr, er);
            cardEl.classList.add('played');
          }
          var energyEl = document.querySelector('.energy-value');
          if (energyEl) { energyEl.classList.add('pulse'); setTimeout(function(){energyEl.classList.remove('pulse');}, 300); }
          window.Combat.playCard(selectedCardIndex, parseInt(enemyEl.dataset.enemy));
          if (enemyEl) {
            var rect = enemyEl.getBoundingClientRect();
            enemyEl.classList.add('hit');
          sfxDamage();
            createParticles(rect.left + rect.width/2, rect.top + rect.height/2);
            setTimeout(function(){enemyEl.classList.remove('hit');}, 300);
          }
          selectedCardIndex = null;
          var allDead = window.Combat.getEnemies().every(function(e){return e.hp <= 0;});
          if (allDead) { setTimeout(function(){window.Combat.endPlayerTurn();}, 300); }
          else { setTimeout(function(){refresh();}, 200); }
        });
      })(enemies[i], parseInt(enemies[i].dataset.enemy));
    }
  }

  function bindPotionClicks(state) {
    var slots = document.querySelectorAll('.potion-slot.filled');
    for (var i = 0; i < slots.length; i++) {
      (function(slot, idx) {
        slot.addEventListener('click', function() {
          var potion = state.potions[idx];
          if (potion && potion.effect) {
            window.Combat.executeEffect(potion.effect);
            state.potions.splice(idx, 1);
            window.GameEngine.emit('potionUsed', {potion: potion});
            refresh();
          }
        });
      })(slots[i], parseInt(slots[i].dataset.potion));
    }
  }

  function renderCard(card, index, state) {
    var cost = window.Deck.getCardCost(card);
    var canPlay = state.energy >= cost && card.type !== 'curse';
    var rarityStyle = card.rarity === 'legendary' ? 'border-color:#d4a017;box-shadow:0 0 8px rgba(212,160,23,0.3)' : card.rarity === 'rare' ? 'border-color:#5b7a9a' : '';
    var cls = card.type === 'curse' ? 'card curse' : canPlay ? 'card' : 'card disabled';
    if (card._upgraded) cls += ' upgraded';
    return '<div class="' + cls + '" data-index="' + index + '" title="' + describeCard(card) + '">' +
      '<div class="card-cost">' + cost + '</div>' +
      '<div class="card-name">' + card.name + '</div>' +
      '<div class="card-type">' + card.type + '</div>' +
      '<div class="card-effects">' + describeEffects(card.effects) + '</div></div>';
  }

  function describeEffects(effects) {
    if (!effects) return '';
    var labels = [];
    for (var i = 0; i < effects.length; i++) {
      var e = effects[i];
      if (e.type === 'damage') labels.push('⚔' + e.value);
      else if (e.type === 'aoeDamage') labels.push('💥' + e.value);
      else if (e.type === 'armor') labels.push('🛡' + e.value);
      else if (e.type === 'poison' || e.type === 'aoePoison') labels.push('☠' + (e.layers || ''));
      else if (e.type === 'burn') labels.push('🔥' + (e.layers || ''));
      else if (e.type === 'draw') labels.push('📜' + e.count);
      else if (e.type === 'strength') labels.push('💪' + e.value);
      else if (e.type === 'weak') labels.push('💤' + (e.turns || ''));
      else if (e.type === 'stun') labels.push('⏸');
      else if (e.type === 'chain') labels.push('⚡' + e.value);
      else if (e.type === 'retainArmor') labels.push('🔒');
      else if (e.type === 'nextTurnEnergy') labels.push('⏳+' + e.value);
      else if (e.type === 'poisonDamage') labels.push('☠x' + (e.multiplier || 2));
      else if (e.type === 'execute') labels.push('🗡');
    }
    return labels.join(' ');
  }

  function describeCard(card) {
    if (!card.effects) return '';
    var parts = [];
    for (var i = 0; i < card.effects.length; i++) {
      var e = card.effects[i];
      if (e.type === 'damage') parts.push('造成 ' + e.value + ' 伤害');
      else if (e.type === 'aoeDamage') parts.push('全体 ' + e.value + ' 伤害');
      else if (e.type === 'armor') parts.push('获得 ' + e.value + ' 护甲');
      else if (e.type === 'poison') parts.push('施加 ' + e.layers + ' 层中毒');
      else if (e.type === 'burn') parts.push('施加 ' + e.layers + ' 层灼烧');
      else if (e.type === 'draw') parts.push('抽 ' + e.count + ' 张牌');
      else if (e.type === 'strength') parts.push('力量 +' + e.value);
      else if (e.type === 'weak') parts.push('虚弱 ' + (e.turns || 1) + ' 回合');
      else if (e.type === 'stun') parts.push('眩晕敌人');
      else if (e.type === 'energy') parts.push('能量 +' + e.value);
      else if (e.type === 'chain') parts.push('弹射 ' + e.value);
      else if (e.type === 'retainArmor') parts.push('护甲保留');
      else if (e.type === 'nextTurnEnergy') parts.push('下回合 +' + e.value + '能量');
      else if (e.type === 'extraTurn') parts.push('额外一个回合');
      else if (e.type === 'execute') parts.push('HP<50%时 ' + e.value + '伤害');
    }
    return parts.join('，');
  }

  function getIntentIcon(enemy) {
    var intent = (enemy.intents && enemy.intents[enemy.intentIndex % enemy.intents.length]) || '';
    var base = intent.split('(')[0];
    if (base === 'attack' || base === 'lifestealAttack') return '⚔';
    if (base === 'defend') return '🛡';
    if (base === 'strengthen' || base === 'strengthenAll') return '⬆';
    if (base === 'summon') return '💀';
    if (base === 'heal') return '❤';
    if (base === 'applyWeak') return '💤';
    if (base === 'applyFrail') return '💥';
    if (base === 'applyCurse') return '👿';
    if (base === 'aoePoison' || base === 'aoe') return '💥';
    if (base === 'charge') return '⚡';
    if (base === 'ultimate') return '☠';
    return '❓';
  }  }

  function getIntentText(enemy) {
    var intent = (enemy.intents && enemy.intents[enemy.intentIndex % enemy.intents.length]) || '';
    var match = intent.match(/^(\w+)\((\d+)\)$/);
    var base = match ? match[1] : intent;
    var val = match ? parseInt(match[2]) : 0;
    var dmg = enemy.damage;
    if (base === 'attack') return '伤害 ' + dmg;
    if (base === 'lifestealAttack') return '吸血 ' + dmg + ' (' + (val||50) + '%)';
    if (base === 'defend') return '防御 ' + val;
    if (base === 'strengthen') return '强化 +' + val;
    if (base === 'strengthenAll') return '全体强化 +' + val;
    if (base === 'summon') return '召唤';
    if (base === 'heal') return '回复 ' + val;
    if (base === 'applyWeak') return '虚弱 1回合';
    if (base === 'applyFrail') return '脆弱 1回合';
    if (base === 'applyCurse') return '诅咒牌';
    if (base === 'aoePoison') return '毒雾 ' + val;
    if (base === 'aoe') return '全体攻击';
    if (base === 'charge') return '蓄力 +' + val;
    if (base === 'ultimate') return '必杀技!';
    return intent;
  }  }

  function showMulligan(state) {
    var overlay = document.createElement('div');
    overlay.id = 'mulligan-overlay';
    overlay.innerHTML = '<h2 style="color:var(--accent)">起始手牌</h2><div style="display:flex;gap:10px">' +
      state.hand.map(function(c){return '<div class="card"><div class="card-name">'+c.name+'</div><div class="card-cost">'+c.cost+'</div></div>';}).join('') +
      '</div><button id="btn-keep">开始战斗</button><button id="btn-mulligan">换牌</button>';
    document.body.appendChild(overlay);
    document.getElementById('btn-keep').addEventListener('click', function(){overlay.remove();});
    document.getElementById('btn-mulligan').addEventListener('click', function(){
      var st = window.GameEngine.getState();
      st.discardPile.push.apply(st.discardPile, st.hand);
      st.hand = [];
      window.Deck.drawCards(3);
      overlay.remove();
      render(st);
    });
  }

  function showFloatText(x, y, text, cls) {
    var el = document.createElement('div');
    el.className = 'float-text ' + (cls || 'damage');
    el.textContent = text;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(function(){el.remove();}, 1000);
  }

  function createProjectile(cardName, fromRect, toRect) {
    var el = document.createElement('div');
    el.className = 'card-projectile';
    el.innerHTML = '<div class="mini-card">' + cardName + '</div>';
    el.style.left = (fromRect.left + fromRect.width/2 - 30) + 'px';
    el.style.top = (fromRect.top - 30) + 'px';
    document.body.appendChild(el);
    requestAnimationFrame(function(){
      el.style.left = (toRect.left + toRect.width/2 - 30) + 'px';
      el.style.top = (toRect.top + toRect.height/2 - 15) + 'px';
    });
    setTimeout(function(){el.remove();}, 500);
  }

  function createParticles(x, y) {
    var colors = ['#e74c3c','#f39c12','#e67e22','#c0392b','#fff'];
    for (var i = 0; i < 12; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      var angle = (Math.PI * 2 * i) / 12;
      var dist = 30 + Math.random() * 40;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(p);
      setTimeout(function(){p.remove();}, 600);
    }
  }

  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  var audioCtx = null;

  function playSound(freq, type, duration, vol) {
    try {
      if (!audioCtx) audioCtx = new AudioCtx();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.value = (vol || 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration || 0.12));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (duration || 0.12));
    } catch(e) {}
  }

  function sfxCardPlay() { playSound(800, 'square', 0.08, 0.04); }
  function sfxDamage() { playSound(120, 'sawtooth', 0.15, 0.06); }
  function sfxEnemyDefeated() { playSound(300, 'triangle', 0.2, 0.05); setTimeout(function(){playSound(500,'triangle',0.15,0.04);},100); }
  function sfxVictory() { playSound(523, 'triangle', 0.15, 0.06); setTimeout(function(){playSound(659,'triangle',0.15,0.06);},150); setTimeout(function(){playSound(784,'triangle',0.3,0.08);},300); }
  function sfxTurnEnd() { playSound(200, 'sine', 0.1, 0.03); }
  function sfxWeakHit() { playSound(80, 'sawtooth', 0.25, 0.08); }

  function refresh() { render(window.GameEngine.getState()); }

  return { show: show, refresh: refresh };
})();

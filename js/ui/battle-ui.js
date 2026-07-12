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
    html += '<div class="stat" style="font-size:14px;color:var(--text-dim)">回合 ' + (window.Combat.getTurnCount()||1) + '</div>';
    var eff = state.effects || {};
    if (eff.weak > 0) html += '<span style="background:#8b4513;color:#fff;padding:1px 6px;border-radius:8px;font-size:12px;margin:0 2px" title="伤害-50%，剩'+eff.weak+'回合">💤'+eff.weak+'</span>';
    if (eff.frail > 0) html += '<span style="background:#4a0a4a;color:#fff;padding:1px 6px;border-radius:8px;font-size:12px;margin:0 2px" title="护甲-50%，剩'+eff.frail+'回合">💥'+eff.frail+'</span>';
    if (eff.vulnerable > 0) html += '<span style="background:#8b0000;color:#fff;padding:1px 6px;border-radius:8px;font-size:12px;margin:0 2px" title="受伤+50%，剩'+eff.vulnerable+'回合">💔'+eff.vulnerable+'</span>';
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
      var statusBadges = '';
      if (e.effects && e.effects.weak > 0) statusBadges += '<span style="background:#8b4513;color:#fff;padding:0 4px;border-radius:4px;font-size:10px;margin:0 1px" title="伤害-50%">💤</span>';
      if (e.effects && e.effects.stun) statusBadges += '<span style="background:#ff0;color:#000;padding:0 4px;border-radius:4px;font-size:10px;margin:0 1px" title="眩晕">⚡</span>';
      if (e.poison > 0) statusBadges += '<span style="background:#2ecc71;color:#fff;padding:0 4px;border-radius:4px;font-size:10px;margin:0 1px" title="中毒'+e.poison+'层">☠'+e.poison+'</span>';
      if (e.burn > 0) statusBadges += '<span style="background:#e67e22;color:#fff;padding:0 4px;border-radius:4px;font-size:10px;margin:0 1px" title="灼烧'+e.burn+'层">🔥'+e.burn+'</span>';
      if (statusBadges) html += '<div style="margin-top:4px">' + statusBadges + '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="hand-area" id="hand-area">';
    for (var hi = 0; hi < state.hand.length; hi++) {
      html += renderCard(state.hand[hi], hi, state);
    }
    html += '</div>';
    var deckCount = state.deck ? state.deck.length : 0;
    var discardCount = state.discardPile ? state.discardPile.length : 0;
    html += '<div style="text-align:center;color:var(--text-dim);font-size:12px;margin:4px 0">📦抽牌堆:' + deckCount + ' | 🗄弃牌堆:' + discardCount + '</div>';
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
  html += '<button id="btn-deck-view" style="font-size:13px;padding:4px 10px">查看牌组</button>';
    html += '<button id="btn-end-turn"' + (phase !== 'PLAYER_TURN' ? ' disabled' : '') + '>结束回合</button>';
    html += '</div></div>';
    app.innerHTML = html;

    bindCardClicks(state);
    bindEnemyClicks();
    bindPotionClicks(state);
    document.getElementById('btn-deck-view').addEventListener('click', function() {
      showDeckViewer();
    });
    // Keyboard shortcuts
    var oldHandler = document.onkeydown;
    document.onkeydown = function(e) {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        document.getElementById('btn-end-turn').click();
        return;
      }
      if (e.key === 'Escape') {
        var dv = document.getElementById('deck-viewer');
        if (dv) { dv.remove(); return; }
        var mo = document.getElementById('mulligan-overlay');
        if (mo) { mo.remove(); return; }
      }
      var num = parseInt(e.key);
      if (num >= 1 && num <= 3) {
        var cards = document.querySelectorAll('.card:not(.curse):not(.disabled)');
        if (cards[num-1]) cards[num-1].click();
      }
    };
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
        if (allDead) { document.body.classList.add('deathblow'); setTimeout(function(){document.body.classList.remove('deathblow');},500); }
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
    var cls = card.type === 'curse' ? 'card curse' : canPlay ? 'card playable' : 'card disabled';
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
      state.hand.map(function(c){return '<div class="card" title="'+describeCard(c)+'"><div class="card-name">'+c.name+'</div><div class="card-cost">'+c.cost+'</div><div class="card-effects" style="font-size:9px">'+describeEffects(c.effects)+'</div></div>';}).join('') +
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
  function sfxDeath() { playSound(200, 'sawtooth', 0.1, 0.05); setTimeout(function(){playSound(150,'sawtooth',0.15,0.05);},120); setTimeout(function(){playSound(80,'sine',0.5,0.06);},300); }
  function sfxShop() { playSound(600, 'triangle', 0.08, 0.03); setTimeout(function(){playSound(800,'triangle',0.08,0.03);},80); }
  function sfxUpgrade() { playSound(400, 'triangle', 0.1, 0.04); setTimeout(function(){playSound(600,'triangle',0.1,0.04);},100); setTimeout(function(){playSound(900,'triangle',0.15,0.05);},200); }

  function showDeckViewer() {
    var state = window.GameEngine.getState();
    var drawCards = state.deck || [];
    var discardCards = state.discardPile || [];
    var html = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:400;display:flex;flex-direction:column;align-items:center;padding:20px;overflow-y:auto" id="deck-viewer">';
    html += '<h3 style="color:var(--accent);margin-bottom:16px">📦 抽牌堆 (' + drawCards.length + ')</h3>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:600px">';
    for (var i = 0; i < drawCards.length; i++) {
      var c = drawCards[i];
      html += '<div style="background:var(--surface);border:1px solid var(--card-border);padding:6px 10px;border-radius:4px;font-size:13px" title="' + describeCard(c) + '">' + c.name + ' (' + c.cost + '费) ' + describeEffects(c.effects) + '</div>';
    }
    if (drawCards.length === 0) html += '<span style="color:var(--text-dim)">空</span>';
    html += '</div>';
    html += '<h3 style="color:var(--accent);margin:16px 0">🗄 弃牌堆 (' + discardCards.length + ')</h3>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:600px">';
    for (var i = 0; i < discardCards.length; i++) {
      var d = discardCards[i];
      html += '<div style="background:var(--surface);border:1px solid var(--card-border);padding:6px 10px;border-radius:4px;font-size:13px;opacity:0.7" title="' + describeCard(d) + '">' + d.name + ' (' + d.cost + '费) ' + describeEffects(d.effects) + '</div>';
    }
    if (discardCards.length === 0) html += '<span style="color:var(--text-dim)">空</span>';
    html += '</div>';
    html += '<button style="margin-top:16px" id="btn-close-deck">关闭</button></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('btn-close-deck').addEventListener('click', function() {
      document.getElementById('deck-viewer').remove();
    });
  }

  function refresh() { render(window.GameEngine.getState()); }

  return { show: show, refresh: refresh };
})();

// 暗黑地牢卡牌爬塔 — 战斗引擎
window.Combat = (() => {
  let _phase = 'IDLE';
  let _enemies = [];
  let _turnCount = 0;

  function getPhase() { return _phase; }
  function getEnemies() { return _enemies; }
  function getTurnCount() { return _turnCount; }

  // === 战斗流程 ===
  function startBattle(enemies) {
    const state = window.GameEngine.getState();
    state.hand = [];
    state.discardPile = [];
    state.armor = 0;
    state.effects = {};
    if (!state.buffs) state.buffs = [];
    _turnCount = 0;
    _enemies = enemies.map(e => ({
      ...e,
      maxHp: e.maxHp || e.hp,
      intentIndex: 0,
      poison: e.poison || 0,
      burn: e.burn || 0,
      effects: e.effects || {}
    }));

    // 遗物 onBattleStart
    window.Relic.triggerHook('onBattleStart', {});

    // Draw starting hand
    window.Deck.drawCards(3);
    _phase = 'PLAYER_TURN';
    window.GameEngine.emit('battleStart', { enemies: _enemies });
  }

  function endPlayerTurn() {
    const state = window.GameEngine.getState();
    // Clear per-turn buffs (弱化/易伤等持续回合的状态在 applyXxx 中管理)
    window.Deck.discardHand();
    if (!state.retainArmor) state.armor = 0;
    state.retainArmor = false;
    state.energy = state.maxEnergy;
    _phase = 'ENEMY_TURN';
    executeEnemyTurn();
    // Check if all enemies are dead
    if (_enemies.every(e => e.hp <= 0)) {
      window.GameEngine.emit('battleVictory', {});
      return;
    }
  }

  function executeEnemyTurn() {
    // Shuffle enemy order
    const order = [..._enemies].sort(() => Math.random() - 0.5);
    for (const enemy of order) {
      if (enemy.hp <= 0) continue;
      if (enemy.effects && enemy.effects.stun) {
        enemy.effects.stun = false;
        window.GameEngine.emit('enemyAction', { enemy: enemy.name, action: 'stunned' });
        continue;
      }
      executeEnemyIntent(enemy);
      if (window.GameEngine.getState().hp <= 0) break;
    }
    _phase = 'DOT_PHASE';
    tickAllDot();
    _phase = 'PLAYER_TURN';
    _turnCount++;
    window.GameEngine.emit('turnStart', { turn: _turnCount });
    // Process regen buffs
    const s2 = window.GameEngine.getState();
    if (s2.buffs && s2.buffs.length > 0) {
      const remaining = [];
      for (const b of s2.buffs) {
        if (b.type === 'regen') {
          s2.hp = Math.min(s2.maxHp, s2.hp + b.value);
          b.turns--;
          if (b.turns > 0) remaining.push(b);
        } else { remaining.push(b); }
      }
      s2.buffs = remaining;
    }
    window.Deck.drawCards(3);
  }

  function executeEnemyIntent(enemy) {
    const intent = enemy.intents[enemy.intentIndex % enemy.intents.length];
    const rawDmg = enemy.damage;

    if (intent.startsWith('attack')) {
      const dmg = calcEnemyDamage(enemy);
      dealDamageToPlayer(dmg);
      window.GameEngine.emit('enemyAction', { enemy: enemy.name, action: 'attack', damage: dmg });
    } else if (intent.startsWith('defend')) {
      const val = parseInt(intent.match(/(\d+)/)?.[1] || 0);
      enemy._shield = (enemy._shield || 0) + val; // 临时护盾，吸收下回合伤害
      window.GameEngine.emit('enemyAction', { enemy: enemy.name, action: 'defend', value: val });
    } else if (intent.startsWith('strengthen')) {
      const val = parseInt(intent.match(/(\d+)/)?.[1] || 0);
      enemy._strengthBonus = (enemy._strengthBonus || 0) + val; // 独立力量加成，不叠加到基础伤害
      window.GameEngine.emit('enemyAction', { enemy: enemy.name, action: 'strengthen', value: val });
    }
    enemy.intentIndex++;
  }

  function tickAllDot() {
    for (const enemy of _enemies) {
      if (enemy.hp <= 0) continue;
      tickDot(enemy);
    }
  }

  // === 伤害与护甲 ===
  function dealDamageToPlayer(dmg) {
    const state = window.GameEngine.getState();
    let actualDmg = dmg;
    // 易伤
    if (state.effects && state.effects.vulnerable > 0) {
      actualDmg = Math.floor(actualDmg * 1.5);
    }
    // 护甲吸收
    if (state.armor > 0) {
      const absorbed = Math.min(state.armor, actualDmg);
      state.armor -= absorbed;
      actualDmg -= absorbed;
    }
    state.hp = Math.max(0, state.hp - actualDmg);
    window.GameEngine.emit('playerDamaged', { damage: actualDmg });
    if (state.hp <= 0) {
      if (state._revivePercent && state._revivePercent > 0) {
        state.hp = Math.floor(state.maxHp * state._revivePercent / 100);
        state._revivePercent = 0;
        return;
      }
      window.Relic.triggerHook('onDeath', {});
      if (state.hp <= 0) {
        window.GameEngine.emit('playerDeath', {});
      }
    }
  }

  function calcDamage(baseDmg) {
    const state = window.GameEngine.getState();
    return baseDmg + (state.strength || 0);
  }

  function calcEnemyDamage(enemy) {
    let dmg = enemy.damage || 0;
    if (enemy.effects && enemy.effects.weak > 0) {
      dmg = Math.floor(dmg * 0.5);
    }
    return dmg;
  }


  function calcDamageToEnemy(rawDmg, enemy) {
    if (enemy._shield && enemy._shield > 0) {
      const absorbed = Math.min(enemy._shield, rawDmg);
      enemy._shield -= absorbed;
      return rawDmg - absorbed;
    }
    return rawDmg;
  }

  function gainArmor(val) {
    const state = window.GameEngine.getState();
    // 脆弱
    if (state.effects && state.effects.frail > 0) {
      val = Math.floor(val * 0.5);
    }
    state.armor += val;
  }

  // === 状态效果 ===
  function applyPoison(target, layers) {
    if (!target.poison) target.poison = 0;
    target.poison += layers;
  }

  function applyBurn(target, layers) {
    if (!target.burn) target.burn = 0;
    target.burn += layers;
  }

  function tickDot(target) {
    if (target.poison > 0) {
      target.hp = Math.max(0, target.hp - target.poison);
      // poison does NOT decay
    }
    if (target.burn > 0) {
      target.hp = Math.max(0, target.hp - target.burn);
      target.burn = Math.max(0, target.burn - 2);
    }
    if (target.hp <= 0) {
      window.GameEngine.emit('enemyDefeated', { enemy: target });
    }
  }

  function applyWeak(target, turns) {
    if (!target.effects) target.effects = {};
    target.effects.weak = turns;
  }

  function applyVulnerable(target, turns) {
    if (!target.effects) target.effects = {};
    target.effects.vulnerable = turns;
  }

  function applyFrail(target, turns) {
    if (!target.effects) target.effects = {};
    target.effects.frail = turns;
  }

  function applyStun(target) {
    if (!target.effects) target.effects = {};
    target.effects.stun = true;
  }

  // === 效果 DSL 执行器 ===
  function executeEffect(effect, target) {
    if (!effect || !effect.type) return;
    const state = window.GameEngine.getState();
    switch (effect.type) {
      case 'damage':
        if (target && target.hp !== undefined) {
          let dmg = calcDamage(effect.value);
          dmg = calcDamageToEnemy(dmg, target);
          target.hp = Math.max(0, target.hp - dmg);
          window.GameEngine.emit('enemyDamaged', { enemy: target, damage: dmg });
        }
        break;
      case 'aoeDamage':
        for (const e of _enemies) {
          if (e.hp <= 0) continue;
          const aoeDmg = calcDamage(effect.value);
          e.hp = Math.max(0, e.hp - aoeDmg);
        }
        break;
      case 'armor':
        gainArmor(effect.value);
        break;
      case 'poison':
        if (target) applyPoison(target, effect.layers);
        break;
      case 'aoePoison':
        for (const e of _enemies) {
          if (e.hp > 0) applyPoison(e, effect.layers);
        }
        break;
      case 'burn':
        if (target) applyBurn(target, effect.layers);
        break;
      case 'weak':
        if (target) applyWeak(target, effect.turns);
        break;
      case 'vulnerable':
        // vulnerable on self (player) or enemy
        if (target && target.hp !== undefined) applyVulnerable(target, effect.turns);
        else { if (!state.effects) state.effects = {}; state.effects.vulnerable = effect.turns; }
        break;
      case 'frail':
        if (!state.effects) state.effects = {};
        state.effects.frail = effect.turns;
        break;
      case 'stun':
        if (target) applyStun(target);
        break;
      case 'strength':
        state.strength += effect.value;
        break;
      case 'draw':
        window.Deck.drawCards(effect.count);
        break;
      case 'energy':
        state.energy += effect.value;
        break;
      case 'heal':
        state.hp = Math.min(state.maxHp, state.hp + effect.value);
        break;
      case 'chain':
        if (target && target.hp !== undefined) {
          const chainDmg = calcDamage(effect.value);
          target.hp = Math.max(0, target.hp - chainDmg);
          // Bounce to another random enemy
          const others = _enemies.filter(e => e !== target && e.hp > 0);
          if (others.length > 0) {
            const bounce = others[Math.floor(Math.random() * others.length)];
            bounce.hp = Math.max(0, bounce.hp - calcDamage(effect.value));
          }
        }
        break;
      case 'retainArmor':
        state.retainArmor = true;
        break;
      case 'nextTurnEnergy':
        state.nextTurnEnergy = (state.nextTurnEnergy || 0) + effect.value;
        break;
      case 'poisonDamage':
        if (target && target.poison) {
          const pd = target.poison * (effect.multiplier || 2);
          target.hp = Math.max(0, target.hp - pd);
        }
        break;
      case 'bonusOnPoison':
        // Bonus damage if target has poison (影袭)
        if (target && target.poison > 0) {
          const bd = calcDamage(effect.value);
          target.hp = Math.max(0, target.hp - bd);
        }
        break;
      case 'perPoisonDamage':
        // Damage per poison layer (暗杀)
        if (target && target.poison) {
          const perDmg = calcDamage(target.poison * effect.value);
          target.hp = Math.max(0, target.hp - perDmg);
        }
        break;
      case 'costReduce':
        if (!state.buffs) state.buffs = [];
        state.buffs.push({type:'costReduce',value:effect.value});
        break;
      case 'regen':
        if (!state.buffs) state.buffs = [];
        state.buffs.push({type:'regen',value:effect.value,turns:effect.turns});
        break;
      case 'duplicate':
        if (state.hand.length > 0) {
          const copy = JSON.parse(JSON.stringify(state.hand[0]));
          copy.cost = 0;
          state.hand.push(copy);
        }
        break;
      case 'revive':
        state._revivePercent = effect.percent;
        break;
      default:
        console.warn('Unknown effect type:', effect.type);
    }
  }

  function executeEffects(effects, target) {
    for (const e of effects) executeEffect(e, target);
  }

  // === 卡牌打出 ===
  function playCard(cardIndex, targetIndex) {
    const state = window.GameEngine.getState();
    if (_phase !== 'PLAYER_TURN') return false;
    const card = state.hand[cardIndex];
    if (!card) return false;
    const cost = window.Deck.getCardCost(card);
    if (state.energy < cost) return false;
    state.energy -= cost;
    const target = _enemies[targetIndex];
    // 根据卡牌类型执行效果
    if (card.effects) executeEffects(card.effects, target);
    // 处理 casts
    if (card.casts !== undefined && card.casts > 1) {
      card.casts--;
      // Card stays in hand (don't discard)
      if (card.casts <= 0) {
        state.hand.splice(cardIndex, 1);
        state.discardPile.push(card);
      }
    } else {
      state.hand.splice(cardIndex, 1);
      state.discardPile.push(card);
    }
    window.GameEngine.emit('cardPlayed', { card, target });
    window.Relic.triggerHook('onCardPlayed', { card, target });
    return true;
  }

  return {
    getPhase, getEnemies, getTurnCount,
    startBattle, endPlayerTurn, playCard,
    dealDamageToPlayer, calcDamage, calcEnemyDamage, calcDamageToEnemy, gainArmor,
    applyPoison, applyBurn, tickDot,
    applyWeak, applyVulnerable, applyFrail, applyStun,
    executeEffect, executeEffects
  };
})();

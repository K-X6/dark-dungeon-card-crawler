// 暗黑地牢卡牌爬塔 — 战斗引擎
window.Combat = (() => {
  let _phase = 'IDLE';
  let _enemies = [];
  let _turnCount = 0;

  function getPhase() { return _phase; }
  function getEnemies() { return _enemies; }
  function getTurnCount() { return _turnCount; }

  function getLivingEnemies() {
    return _enemies.filter(enemy => enemy.hp > 0);
  }

  function isBattleWon() {
    return _enemies.length > 0 && getLivingEnemies().length === 0;
  }

  function isPlayerDead() {
    const state = window.GameEngine.getState();
    return !!state && state.hp <= 0;
  }

  function finishBattle(result) {
    if (_phase === 'BATTLE_END') return true;
    _phase = 'BATTLE_END';
    if (result === 'victory') {
      window.GameEngine.emit('battleVictory', {});
    }
    return true;
  }

  function canContinueBattle() {
    if (_phase === 'BATTLE_END') return false;
    if (isPlayerDead()) return !finishBattle('defeat');
    if (isBattleWon()) return !finishBattle('victory');
    return true;
  }

  function markEnemyDefeated(enemy) {
    if (!enemy || enemy.hp > 0 || enemy._defeatEmitted) return;
    enemy._defeatEmitted = true;
    window.GameEngine.emit('enemyDefeated', { enemy });
    window.Relic.triggerHook('onEnemyKilled', { enemy });
  }

  // === 战斗流程 ===
  function startBattle(enemies) {
    const state = window.GameEngine.getState();
    // Reassemble the persistent deck before clearing transient battle piles.
    state.deck = [...(state.deck || []), ...(state.hand || []), ...(state.discardPile || [])];
    state.hand = [];
    state.discardPile = [];
    state.armor = 0;
    state.strength = 0;
    state.effects = {};
    state.combatBuffs = {};
    state.nextTurnEnergy = 0;
    state.nextTurnDraw = 0;
    state.extraTurn = false;
    state._turnStrength = 0;
    state._battleEnergyBonus = 0;
    state._hasDealtDamage = false;
    if (!state.buffs) state.buffs = [];
    window.Deck.shuffleDeck();
    state.energy = state.maxEnergy;
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
    // Process buffs granted by events for a limited number of battles.
    const persistentBuffs = [];
    for (const buff of state.buffs) {
      if (buff.type !== 'battleStart') { persistentBuffs.push(buff); continue; }
      if (buff.buffType === 'strength') state.strength += buff.value;
      else if (buff.buffType === 'startArmor') state.armor += buff.value;
      else if (buff.buffType === 'bonusEnergy') state._battleEnergyBonus += buff.value;
      buff.turns = (buff.turns || 1) - 1;
      if (buff.turns > 0) persistentBuffs.push(buff);
    }
    state.buffs = persistentBuffs;
    state.energy += state._battleEnergyBonus;

    // Draw starting hand
    window.Deck.drawCards(3);
    _phase = 'PLAYER_TURN';
    window.GameEngine.emit('battleStart', { enemies: _enemies });
  }

  function endPlayerTurn() {
    const state = window.GameEngine.getState();
    if (!canContinueBattle()) return;
    decayPlayerEffects();
    triggerCursesInHand();
    if (!canContinueBattle()) return;
    window.Deck.discardHand();
    if (!state.retainArmor) state.armor = 0;
    state.retainArmor = false;
    clearTurnBonuses();

    if (state.extraTurn) {
      state.extraTurn = false;
      beginPlayerTurn();
      return;
    }

    _phase = 'ENEMY_TURN';
    executeEnemyTurn();
  }

  function executeEnemyTurn() {
    // Shuffle enemy order
    const order = getLivingEnemies().sort(() => Math.random() - 0.5);
    for (const enemy of order) {
      if (enemy.effects && enemy.effects.stun) {
        enemy.effects.stun = false;
        window.GameEngine.emit('enemyAction', { enemy: enemy.name, action: 'stunned' });
        decayEnemyEffects(enemy);
        continue;
      }
      executeEnemyIntent(enemy);
      if (!canContinueBattle()) break;
      decayEnemyEffects(enemy);
    }
    if (!canContinueBattle()) return;
    _phase = 'DOT_PHASE';
    tickAllDot();
    if (!canContinueBattle()) return;
    _turnCount++;
    window.GameEngine.emit('turnStart', { turn: _turnCount });
    window.Relic.triggerHook('onTurnStart', { turn: _turnCount });
    beginPlayerTurn();
  }

  function beginPlayerTurn() {
    const state = window.GameEngine.getState();
    _phase = 'PLAYER_TURN';
    state.energy = state.maxEnergy + (state._battleEnergyBonus || 0) + (state.nextTurnEnergy || 0);
    state.nextTurnEnergy = 0;

    const buffs = state.combatBuffs || {};
    if (buffs.armorPerTurn) gainArmor(buffs.armorPerTurn);
    if (buffs.armorAndPoisonPerTurn) {
      gainArmor(buffs.armorAndPoisonPerTurn);
      for (const enemy of getLivingEnemies()) applyPoison(enemy, buffs.armorAndPoisonPerTurn);
    }
    if (buffs.regen) {
      state.hp = Math.min(state.maxHp, state.hp + buffs.regen.value);
      buffs.regen.turns--;
      if (buffs.regen.turns <= 0) delete buffs.regen;
    }

    const drawCount = 3 + (buffs.drawPerTurn || 0) + (state.nextTurnDraw || 0);
    state.nextTurnDraw = 0;
    window.Deck.drawCards(Math.max(0, drawCount));

    if (buffs.poisonDamageMultiplier && buffs.poisonDamageMultiplier.turns > 0) {
      buffs.poisonDamageMultiplier.turns--;
      if (buffs.poisonDamageMultiplier.turns <= 0) delete buffs.poisonDamageMultiplier;
    }
  }

  function clearTurnBonuses() {
    const state = window.GameEngine.getState();
    if (state._turnStrength) state.strength -= state._turnStrength;
    state._turnStrength = 0;
    if (state.combatBuffs) delete state.combatBuffs.costReduce;
  }

  function triggerCursesInHand() {
    const state = window.GameEngine.getState();
    for (const card of state.hand) {
      if (card.type !== 'curse' || !card.curseEffect || card._curseTriggered) continue;
      card._curseTriggered = true;
      const effect = card.curseEffect;
      if (effect.type === 'loseHpFlat') dealDamageToPlayer(effect.value);
      else if (effect.type === 'nextTurnEnergy') state.nextTurnEnergy += effect.value;
      else if (effect.type === 'nextTurnDraw') state.nextTurnDraw += effect.value;
      else if (effect.type === 'weak') { state.effects.weak = Math.max(state.effects.weak || 0, effect.turns || 1); }
      else if (effect.type === 'vulnerable') { state.effects.vulnerable = Math.max(state.effects.vulnerable || 0, effect.turns || 1); }
    }
  }

  function decayEnemyEffects(enemy) {
    if (!enemy.effects) return;
    for (const key of ['weak', 'vulnerable']) {
      if (enemy.effects[key] > 0) {
        enemy.effects[key]--;
        if (enemy.effects[key] <= 0) delete enemy.effects[key];
      }
    }
  }

  function decayPlayerEffects() {
    const state = window.GameEngine.getState();
    if (!state.effects) return;
    for (const key of ['weak', 'frail', 'vulnerable']) {
      if (state.effects[key] > 0) {
        state.effects[key]--;
        if (state.effects[key] <= 0) delete state.effects[key];
      }
    }
  }

  function executeEnemyIntent(enemy) {
    const state = window.GameEngine.getState();
    const intent = enemy.intents[enemy.intentIndex % enemy.intents.length];
    const rawDmg = enemy.damage;
    const match = intent.match(/^(\w+)\((\d+)\)$/);
    const baseIntent = match ? match[1] : intent;
    const val = match ? parseInt(match[2]) : 0;

    if (baseIntent === 'attack' || baseIntent === 'lifestealAttack') {
      const dmg = calcEnemyDamage(enemy);
      dealDamageToPlayer(dmg, enemy);
      if (baseIntent === 'lifestealAttack') {
        const heal = Math.floor(dmg * (val / 100) || dmg * 0.5);
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
      }
    } else if (baseIntent === 'defend') {
      enemy._shield = (enemy._shield || 0) + val;
    } else if (baseIntent === 'strengthen' || baseIntent === 'strengthenAll') {
      const amount = val || 2;
      if (baseIntent === 'strengthenAll') {
        for (const e of getLivingEnemies()) e._strengthBonus = (e._strengthBonus || 0) + amount;
      } else {
        enemy._strengthBonus = (enemy._strengthBonus || 0) + amount;
      }
    } else if (baseIntent === 'applyWeak') {
      if (!state.effects) state.effects = {};
      state.effects.weak = (state.effects.weak || 0) + 1;
    } else if (baseIntent === 'applyFrail') {
      if (!state.effects) state.effects = {};
      state.effects.frail = (state.effects.frail || 0) + 1;
    } else if (baseIntent === 'applyCurse') {
      const curses = window.CARDS.filter(c => c.type === 'curse');
      if (curses.length > 0) {
        const curse = JSON.parse(JSON.stringify(curses[Math.floor(Math.random() * curses.length)]));
        state.hand.push(curse);
      }
    } else if (baseIntent === 'aoePoison') {
      state.hp = Math.max(0, state.hp - val); // simplified: direct damage as poison
    } else if (baseIntent === 'aoe') {
      const dmg = calcEnemyDamage(enemy);
      dealDamageToPlayer(Math.floor(dmg * 0.7), enemy); // AOE does 70% of normal
    } else if (baseIntent === 'heal') {
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + val);
    } else if (baseIntent === 'summon') {
      // summon a minion - simplified: enemy heals + buffs itself
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + 10);
      enemy._strengthBonus = (enemy._strengthBonus || 0) + 2;
    } else if (baseIntent === 'charge') {
      enemy._chargeBonus = (enemy._chargeBonus || 0) + (val > 0 ? val : 10);
    }
    // 'ultimate' uses the accumulated charge bonus
    if (baseIntent === 'ultimate') {
      const charge = enemy._chargeBonus || 30;
      dealDamageToPlayer(calcEnemyDamage(enemy) + charge, enemy);
      enemy._chargeBonus = 0;
    }
    enemy.intentIndex++;
  }

  function tickAllDot() {
    for (const enemy of getLivingEnemies()) tickDot(enemy);
  }

  // === 伤害与护甲 ===
  function dealDamageToPlayer(dmg, attacker) {
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
    if (actualDmg > 0 && state.combatBuffs && state.combatBuffs.strengthOnHit) {
      state.strength += state.combatBuffs.strengthOnHit;
    }
    if (actualDmg > 0 && attacker && state.combatBuffs && state.combatBuffs.thorns) {
      dealDamageToEnemy(attacker, state.combatBuffs.thorns, { ignoreVulnerable: true });
    }
    if (actualDmg > 0) window.Relic.triggerHook('onDamageTaken', {damage:actualDmg,attacker});
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
    let dmg = baseDmg + (state.strength || 0);
    if (state.effects && state.effects.weak > 0) { dmg = Math.floor(dmg * 0.5); }
    return dmg;
  }

  function calcEnemyDamage(enemy) {
    let dmg = (enemy.damage || 0) + (enemy._strengthBonus || 0) - (enemy._damageReduction || 0);
    if (enemy.effects && enemy.effects.weak > 0) {
      dmg = Math.floor(dmg * 0.5);
    }
    return Math.max(0, dmg);
  }


  function calcDamageToEnemy(rawDmg, enemy) {
    let damage = rawDmg;
    if (enemy.effects && enemy.effects.vulnerable > 0) damage = Math.floor(damage * 1.5);
    if (enemy._shield && enemy._shield > 0) {
      const absorbed = Math.min(enemy._shield, damage);
      enemy._shield -= absorbed;
      return damage - absorbed;
    }
    return damage;
  }

  function dealDamageToEnemy(target, rawDmg, options) {
    if (!target || target.hp <= 0) return 0;
    const damage = options && options.ignoreVulnerable
      ? rawDmg
      : calcDamageToEnemy(rawDmg, target);
    target.hp = Math.max(0, target.hp - damage);
    window.GameEngine.emit('enemyDamaged', { enemy: target, damage });
    const state = window.GameEngine.getState();
    const firstHit = !state._hasDealtDamage;
    if (damage > 0) {
      state._hasDealtDamage = true;
      window.Relic.triggerHook('onDamageDealt', {damage,target,targetHp:target.maxHp,firstHit});
    }
    markEnemyDefeated(target);
    return damage;
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
      const buffs = window.GameEngine.getState().combatBuffs || {};
      const multiplier = buffs.poisonDamageMultiplier ? buffs.poisonDamageMultiplier.value : 1;
      dealDamageToEnemy(target, Math.floor(target.poison * multiplier), { ignoreVulnerable: true });
      // poison does NOT decay
    }
    if (target.hp > 0 && target.burn > 0) {
      dealDamageToEnemy(target, target.burn, { ignoreVulnerable: true });
      target.burn = Math.max(0, target.burn - 2);
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
          dealDamageToEnemy(target, calcDamage(effect.value));
        }
        break;
      case 'aoeDamage':
        for (let hit = 0; hit < (effect.times || 1); hit++) {
          for (const e of getLivingEnemies()) dealDamageToEnemy(e, calcDamage(effect.value));
        }
        break;
      case 'armor':
        gainArmor(effect.value);
        break;
      case 'poison':
        if (target) applyPoison(target, effect.layers);
        break;
      case 'aoePoison':
        for (const e of getLivingEnemies()) applyPoison(e, effect.layers);
        break;
      case 'burn':
        if (target) applyBurn(target, effect.layers);
        break;
      case 'weak':
        if (target) applyWeak(target, effect.turns);
        else for (const e of getLivingEnemies()) applyWeak(e, effect.turns);
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
        else for (const e of getLivingEnemies()) applyStun(e);
        break;
      case 'strength':
        state.strength += effect.value;
        if (effect.duration === 'thisTurn') state._turnStrength = (state._turnStrength || 0) + effect.value;
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
          dealDamageToEnemy(target, chainDmg);
          // Bounce to another random enemy
          const others = getLivingEnemies().filter(e => e !== target);
          if (others.length > 0) {
            const bounce = others[Math.floor(Math.random() * others.length)];
            dealDamageToEnemy(bounce, calcDamage(effect.value));
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
          dealDamageToEnemy(target, pd, { ignoreVulnerable: true });
        }
        break;
      case 'bonusOnPoison':
        // Bonus damage if target has poison (影袭)
        if (target && target.poison > 0) {
          const bd = calcDamage(effect.value);
          dealDamageToEnemy(target, bd);
        }
        break;
      case 'perPoisonDamage':
        // Damage per poison layer (暗杀)
        if (target && target.poison) {
          const perDmg = calcDamage(target.poison * effect.value);
          dealDamageToEnemy(target, perDmg);
        }
        break;
      case 'costReduce':
        state.combatBuffs = state.combatBuffs || {};
        state.combatBuffs.costReduce = (state.combatBuffs.costReduce || 0) + effect.value;
        break;
      case 'regen':
        state.combatBuffs = state.combatBuffs || {};
        state.combatBuffs.regen = {value:effect.value,turns:effect.turns};
        break;
      case 'duplicate':
        if (state.hand.length > 0) {
          const candidates = state.hand.filter(card => card.type !== 'curse');
          for (let i = 0; i < (effect.count || 1) && candidates.length; i++) {
            const copy = JSON.parse(JSON.stringify(candidates[candidates.length - 1]));
            copy.cost = 0;
            state.hand.push(copy);
          }
        }
        break;
      case 'revive':
        state._revivePercent = effect.percent;
        break;
      case 'loseHpFlat':
        state.hp = Math.max(0, state.hp - effect.value);
        if (state.hp <= 0) window.GameEngine.emit('playerDeath', {});
        break;
      case 'enemyDmgReduce': {
        const targets = target ? [target] : getLivingEnemies();
        for (const enemy of targets) enemy._damageReduction = (enemy._damageReduction || 0) + effect.value;
        break;
      }
      case 'execute':
        if (target && target.hp > 0 && target.hp / target.maxHp < effect.threshold / 100) {
          dealDamageToEnemy(target, calcDamage(effect.value));
        }
        break;
      case 'buff':
        state.combatBuffs = state.combatBuffs || {};
        state.combatBuffs[effect.buffType] = (state.combatBuffs[effect.buffType] || 0) + effect.value;
        break;
      case 'retrieve':
        for (let i = 0; i < (effect.count || 1) && state.discardPile.length > 0; i++) {
          const card = state.discardPile.pop();
          delete card._curseTriggered;
          state.hand.push(card);
        }
        break;
      case 'thorns':
        state.combatBuffs = state.combatBuffs || {};
        state.combatBuffs.thorns = (state.combatBuffs.thorns || 0) + effect.value;
        break;
      case 'extraTurn':
        state.extraTurn = true;
        break;
      case 'drawPerEnemy':
        window.Deck.drawCards((effect.count || 1) * getLivingEnemies().length);
        break;
      case 'poisonDamageBuff':
        state.combatBuffs = state.combatBuffs || {};
        state.combatBuffs.poisonDamageMultiplier = {value:effect.multiplier || 1,turns:effect.duration || 1};
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
    if (card.type === 'attack' && state.combatBuffs && state.combatBuffs.firstAttackFree) {
      delete state.combatBuffs.firstAttackFree;
    }
    if (card.type === 'attack' && target && state.combatBuffs && state.combatBuffs.firstAttackBonus) {
      dealDamageToEnemy(target, state.combatBuffs.firstAttackBonus);
      delete state.combatBuffs.firstAttackBonus;
    }
    // 根据卡牌类型执行效果
    if (card.effects) executeEffects(card.effects, target);
    if (card.type === 'attack' && target && target.hp > 0 && state.combatBuffs && state.combatBuffs.poisonOnAttack) {
      applyPoison(target, state.combatBuffs.poisonOnAttack);
    }
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
    canContinueBattle();
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

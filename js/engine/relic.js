// 暗黑地牢卡牌爬塔 — 遗物钩子系统
window.Relic = (() => {
  function triggerHook(hookName, context) {
    const state = window.GameEngine.getState();
    if (!state || !state.relics) return;
    const triggeredRelics = state.relics.filter(r => r.hook === hookName);
    for (const relic of triggeredRelics) {
      try {
        executeRelicEffect(relic, hookName, context);
      } catch(e) {
        console.warn('Relic effect error:', relic.name, e);
      }
    }
  }

  function executeRelicEffect(relic, hook, ctx) {
    const state = window.GameEngine.getState();
    const eff = relic.effect;
    if (!eff) return;

    switch (hook) {
      case 'onBattleStart':
        if (eff.armor) state.armor += eff.armor;
        if (eff.maxHp) state.maxHp += eff.maxHp;
        if (eff.firstTurnEnergy) state.energy += eff.firstTurnEnergy;
        if (eff.potionSlots) { /* handled by UI */ }
        if (eff.randomPoison) { /* combat will handle */ }
        if (eff.firstAttackBonus) { /* combat tracks first attack */ }
        if (eff.extraDraw) window.Deck.drawCards(eff.extraDraw);
        if (eff.strengthPerCurse) {
          const curseCount = [...state.deck, ...state.hand, ...state.discardPile].filter(c => c.type === 'curse').length;
          state.strength += curseCount * eff.strengthPerCurse;
        }
        if (eff.healToHalfIfLow && state.hp < state.maxHp * 0.5) {
          state.hp = Math.floor(state.maxHp * 0.5);
        }
        if (eff.bonusEnergy) state.maxEnergy += eff.bonusEnergy;
        if (eff.lowHpStrength && state.hp < state.maxHp * 0.3) state.strength += eff.lowHpStrength;
        if (eff.seeIntentTurns) { /* handled by UI */ }
        if (eff.costReduceAll) { /* handled by deck.getCardCost */ }
        if (eff.firstAttackFree) { /* handled by combat */ }
        break;
      case 'onTurnStart':
        // 力量图腾
        if (eff.strengthEvery3) {
          const turn = ctx.turn || 0;
          if (turn > 0 && turn % 3 === 0) state.strength += eff.strengthEvery3;
        }
        break;
      case 'onDamageDealt':
        if (eff.lifestealPercent) {
          const heal = Math.floor((ctx.damage || 0) * eff.lifestealPercent / 100);
          state.hp = Math.min(state.maxHp, state.hp + heal);
        }
        if (eff.firstHitPercent && ctx.firstHit) {
          const extra = Math.floor((ctx.targetHp || 0) * eff.firstHitPercent / 100);
          if (ctx.target) ctx.target.hp = Math.max(0, ctx.target.hp - extra);
        }
        break;
      case 'onDamageTaken':
        if (eff.reflect && ctx.attacker) {
          ctx.attacker.hp = Math.max(0, ctx.attacker.hp - eff.reflect);
        }
        break;
      case 'onEnemyKilled':
        if (eff.healOnKill) {
          state.hp = Math.min(state.maxHp, state.hp + eff.healOnKill);
        }
        break;
      case 'onDeath':
        if (eff.revivePercent) {
          state.hp = Math.floor(state.maxHp * eff.revivePercent / 100);
          // 一次性消耗
          const idx = state.relics.indexOf(relic);
          if (idx >= 0) state.relics.splice(idx, 1);
        }
        break;
      case 'onCardPlayed':
        if (eff.armorOnAbility && ctx.card && ctx.card.type === 'ability') {
          state.armor += eff.armorOnAbility;
        }
        if (eff.energyOn3Ability && ctx.card && ctx.card.type === 'ability') {
          if (!relic._abilityCount) relic._abilityCount = 0;
          relic._abilityCount++;
          if (relic._abilityCount >= 3) {
            state.energy += eff.energyOn3Ability;
            relic._abilityCount = 0;
          }
        }
        break;
      case 'onEnterRest':
        if (eff.bonusHeal) {
          state.hp = Math.min(state.maxHp, state.hp + eff.bonusHeal);
        }
        break;
      case 'onEnterShop':
        if (eff.gainCopyPotion) {
          const copyPotion = window.POTIONS.find(p => p.id === 'copy_potion');
          if (copyPotion && state.potions.length < 3 + (state.relics.find(r => r.effect && r.effect.potionSlots) ? 1 : 0)) {
            state.potions.push(JSON.parse(JSON.stringify(copyPotion)));
          }
        }
        break;
      case 'onPostBattle':
        // lucky coin handled by UI
        break;
    }
  }

  return { triggerHook };
})();

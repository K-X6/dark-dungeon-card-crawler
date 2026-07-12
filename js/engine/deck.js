// 暗黑地牢卡牌爬塔 — 牌组管理

window.Deck = (() => {
  function drawCards(count) {
    const state = window.GameEngine.getState();
    if (!state) return;
    let drawn = 0;
    while (drawn < count) {
      if (state.deck.length === 0) {
        // 弃牌堆洗入抽牌堆
        if (state.discardPile.length === 0) break; // 无牌可抽
        shuffleArray(state.discardPile);
        state.deck = state.discardPile;
        state.discardPile = [];
      }
      state.hand.push(state.deck.pop());
      drawn++;
    }
  }

  function discardHand() {
    const state = window.GameEngine.getState();
    if (!state) return;
    state.discardPile.push(...state.hand);
    state.hand = [];
  }

  function shuffleDeck() {
    const state = window.GameEngine.getState();
    if (!state) return;
    shuffleArray(state.deck);
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function addCardToDeck(card) {
    const state = window.GameEngine.getState();
    if (!state) return;
    state.deck.push(JSON.parse(JSON.stringify(card)));
  }

  function removeCardFromDeck(index) {
    const state = window.GameEngine.getState();
    if (!state) return false;
    const total = state.deck.length + state.hand.length + state.discardPile.length;
    if (total <= 5) return false; // 最小牌组 5 张
    state.deck.splice(index, 1);
    return true;
  }

  function getDeckSize() {
    const state = window.GameEngine.getState();
    if (!state) return 0;
    return state.deck.length + state.hand.length + state.discardPile.length;
  }

  function getCardCost(card) {
    const state = window.GameEngine.getState();
    if (!state || !card) return 99;
    let cost = (card._upgraded && card.upgraded && card.upgraded.upgradedCost !== undefined) ? card.upgraded.upgradedCost : card.cost;
    // 应用遗物费用减免
    if (state.relics) {
      for (const relic of state.relics) {
        if (relic.effect && relic.effect.abilityCostReduce && card.type === 'ability') { cost -= relic.effect.abilityCostReduce; }
      if (relic.effect && relic.effect.costReduceAll) {
          cost -= relic.effect.costReduceAll;
        }
      }
    }
    // 应用药水/临时减免（通过 GameState buffs）
    if (state.buffs) {
      for (const buff of state.buffs) {
        if (buff.type === 'costReduce') {
          cost -= buff.value;
        }
      }
    }
    return Math.max(0, cost);
  }

  return { drawCards, discardHand, shuffleDeck, addCardToDeck, removeCardFromDeck, getDeckSize, getCardCost };
})();

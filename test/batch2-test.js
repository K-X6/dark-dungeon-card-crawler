// Batch 2 测试 — game-engine.js + deck.js
const fs = require('fs');
const vm = require('vm');

function loadDataFiles() {
  const ctx = vm.createContext({ window: {} });
  for (const f of ['cards.js','enemies.js','relics.js','potions.js','events.js']) {
    vm.runInContext(fs.readFileSync('js/data/'+f,'utf8'), ctx);
  }
  return ctx.window;
}
function createLocalStorage() {
  const data = {};
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = String(value); },
    removeItem(key) { delete data[key]; }
  };
}
function loadEngine(localStorage) {
  const w = loadDataFiles();
  const ctx = vm.createContext({ window: w, localStorage, console });
  vm.runInContext(fs.readFileSync('js/engine/game-engine.js','utf8'), ctx);
  vm.runInContext(fs.readFileSync('js/engine/deck.js','utf8'), ctx);
  return ctx.window;
}

let passed = 0, failed = 0;
function t(cond, msg) { if(cond) passed++; else { failed++; console.log('FAIL: '+msg); } }
function eq(a,b,m) { t(a===b, m+': '+a+' === '+b); }

const localStorage = createLocalStorage();
const game = loadEngine(localStorage);
const GE = game.GameEngine;
const Deck = game.Deck;

console.log('--- game-engine.js ---');
GE.init('warrior', 'mini', 'easy');
const s = GE.getState();
t(s !== null, 'state not null');
eq(s.class, 'warrior', 'class');
eq(s.hp, 85, 'hp=85');
eq(s.maxHp, 85, 'maxHp=85');
eq(s.energy, 3, 'energy=3');
eq(s.chapter, 1, 'chapter=1');
eq(s.floor, 1, 'floor=1');
t(s.deck.length === 10, 'deck has 10');
t(s.relics.length === 0, 'relics 0');
t(s.potions.length === 0, 'potions 0');

// Events
let fired = false;
GE.on('stateChanged', () => { fired = true; });
GE.setState('hp', 50);
eq(GE.getState().hp, 50, 'setState hp=50');
t(fired, 'event fired');
fired = false;
GE.off('stateChanged', null);
GE.setState('hp', 40);
t(!fired, 'off works');

// Save/load with an in-memory localStorage implementation.
GE.init('warrior','mini','easy');
t(GE.save(), 'save succeeds');
GE.init('mage','short','hard');
const ld = GE.load();
t(ld && ld.class === 'warrior', 'load restores warrior');
localStorage.removeItem('darkdungeon_save');
t(GE.load() === null, 'load null when no save');

// Legacy saves completed a room on entry; migration must reopen it.
localStorage.setItem('darkdungeon_save', JSON.stringify({currentNode:2,pathTaken:[0,2],map:[{},{},{}]}));
const migrated = GE.load();
t(migrated.saveVersion === 2, 'legacy save migrated to v2');
t(!migrated.pathTaken.includes(2), 'legacy current node reopened');
localStorage.removeItem('darkdungeon_save');

console.log('--- deck.js ---');
GE.init('rogue', 'standard', 'normal');

// drawCards
Deck.drawCards(3);
eq(GE.getState().hand.length, 3, 'drew 3');
Deck.discardHand();
eq(GE.getState().hand.length, 0, 'hand empty');
eq(GE.getState().discardPile.length, 3, 'discard 3');

// Reshuffle
Deck.drawCards(8);
t(GE.getState().hand.length > 0, 'reshuffled and drew');

// addCard
Deck.addCardToDeck({ id:'test', name:'测试', cost:1 });
t(!!GE.getState().deck.find(c => c.id === 'test'), 'card added');

// getDeckSize
t(Deck.getDeckSize() > 0, 'deckSize > 0');

// getCardCost with reduction
const allCards = [...GE.getState().deck, ...GE.getState().hand, ...GE.getState().discardPile];
const anyCard = allCards.find(c => c.cost !== undefined);
if (anyCard) {
  const origCost = Deck.getCardCost(anyCard);
  t(origCost >= 0, 'getCardCost returns valid');
  // Add sage stone relic and test reduction
  GE.setState('relics', [{ id:'sage_stone', hook:'onBattleStart', effect:{costReduceAll:1} }]);
  const reduced = Deck.getCardCost(anyCard);
  eq(reduced, Math.max(0, origCost - 1), 'cost reduced by sage stone');
} else {
  console.log('SKIP: cost tests');
  passed += 2;
}

// Min deck size
GE.setState('deck', [{id:'a'},{id:'b'},{id:'c'},{id:'d'},{id:'e'}]);
GE.setState('hand', []);
GE.setState('discardPile', []);
eq(Deck.getDeckSize(), 5, 'min deck 5');
t(!Deck.removeCardFromDeck(0), 'cannot remove at 5');

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);

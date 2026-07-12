// Regression coverage for bugs found during the project health check.
const fs = require('fs');
const vm = require('vm');

let passed = 0;
let failed = 0;
function test(condition, message) {
  if (condition) passed++;
  else { failed++; console.log('FAIL: ' + message); }
}

function loadGame() {
  const warnings = [];
  const ctx = vm.createContext({
    window: {},
    console: { log: console.log, warn: (...args) => warnings.push(args.join(' ')) }
  });
  for (const name of ['cards', 'enemies', 'relics', 'potions', 'events']) {
    vm.runInContext(fs.readFileSync('js/data/' + name + '.js', 'utf8'), ctx);
  }
  for (const name of ['game-engine', 'deck', 'combat', 'relic', 'map']) {
    vm.runInContext(fs.readFileSync('js/engine/' + name + '.js', 'utf8'), ctx);
  }
  return { game: ctx.window, warnings };
}

(async function run() {
  const { game, warnings } = loadGame();
  const GE = game.GameEngine;
  const Combat = game.Combat;

  GE.init('rogue', 'mini', 'easy');
  Combat.startBattle([{name:'守卫', hp:30, maxHp:30, damage:0, intents:['defend(5)'], poison:0, burn:0, effects:{}}]);
  GE.getState().nextTurnEnergy = 1;
  Combat.endPlayerTurn();
  test(Combat.getEnemies()[0]._shield === 5, 'parameterized enemy intent is parsed');
  test(GE.getState().energy === 3, 'next-turn energy is consumed');

  GE.init('warrior', 'mini', 'easy');
  Combat.startBattle([{name:'木桩', hp:30, maxHp:30, damage:0, intents:['attack'], poison:0, burn:0, effects:{stun:true}}]);
  GE.getState().hand = [JSON.parse(JSON.stringify(game.CARDS.find(card => card.id === 'curse_bleed')))];
  GE.getState().deck = [];
  GE.getState().discardPile = [];
  Combat.endPlayerTurn();
  test(GE.getState().hp === 82, 'curse triggers once at end of turn');
  test(GE.getState().hand[0] && !GE.getState().hand[0]._curseTriggered, 'redrawn curse can trigger again');

  const effectTypes = [...new Set(game.CARDS.flatMap(card => card.effects || []).map(effect => effect.type))];
  GE.init('warrior', 'mini', 'easy');
  Combat.startBattle([{name:'测试目标', hp:999, maxHp:999, damage:0, intents:['attack'], poison:3, burn:0, effects:{}}]);
  for (const type of effectTypes) {
    const card = game.CARDS.find(item => (item.effects || []).some(effect => effect.type === type));
    const effect = card.effects.find(item => item.type === type);
    Combat.executeEffect(effect, Combat.getEnemies()[0]);
  }
  test(!warnings.some(message => message.includes('Unknown effect type')), 'all declared card effect types are implemented');

  for (let run = 0; run < 100; run++) {
    GE.init('warrior', 'mini', 'easy');
    const nodes = game.Map.generateFullMap('mini')[0].nodes;
    test(nodes[0].type === 'battle', 'map always starts with a battle');
    for (let i = 0; i < nodes.length - 1; i++) {
      const branches = nodes[i].branches;
      test(branches.length === new Set(branches).size, 'map branches are unique');
      test(branches.every(index => index > i), 'map branches only move forward');
    }
  }

  GE.init('warrior', 'mini', 'easy');
  GE.getState().map = game.Map.generateFullMap('mini')[0].nodes;
  game.Map.advanceNode(0);
  test(!GE.getState().pathTaken.includes(0), 'entering a room does not complete it');
  game.Map.completeCurrentNode();
  test(GE.getState().pathTaken.includes(0), 'room unlocks paths only after completion');

  const app = { innerHTML: '' };
  const elements = { app };
  const menuContext = vm.createContext({
    window: { GameEngine: { load: () => null } },
    document: { getElementById(id) { return elements[id] || (elements[id] = { addEventListener() {}, style: {} }); } },
    localStorage: { getItem: () => null, removeItem() {} },
    confirm: () => true
  });
  vm.runInContext(fs.readFileSync('js/ui/menu.js', 'utf8'), menuContext);
  menuContext.window.Menu.show();
  test(!app.innerHTML.includes('var bestScore'), 'menu does not render JavaScript source');
  test(app.innerHTML.includes('id="btn-settings"'), 'settings entry is rendered');

  // A playerDeath handler renders the result screen synchronously. BattleUI
  // must not overwrite it with one final refresh after the enemy turn.
  function makeElement() {
    const listeners = {};
    return {
      innerHTML: '', style: {}, dataset: {}, listeners,
      classList: { add() {}, remove() {} },
      addEventListener(type, handler) { listeners[type] = handler; },
      appendChild() {}, remove() {},
      getBoundingClientRect() { return {left:0,top:0,width:10,height:10}; }
    };
  }
  const battleApp = makeElement();
  const battleElements = { app: battleApp };
  const battleDocument = {
    body: makeElement(), onkeydown: null,
    getElementById(id) { return battleElements[id] || (battleElements[id] = makeElement()); },
    querySelectorAll() { return []; }, querySelector() { return null; },
    createElement: makeElement
  };
  const battleBase = {
    console, document: battleDocument, confirm: () => true,
    setTimeout() {}, localStorage: {getItem: () => '1', setItem() {}},
    innerWidth: 1000, innerHeight: 800
  };
  battleBase.window = battleBase;
  const battleContext = vm.createContext(battleBase);
  for (const name of ['cards', 'enemies', 'relics', 'potions', 'events']) {
    vm.runInContext(fs.readFileSync('js/data/' + name + '.js', 'utf8'), battleContext);
  }
  for (const name of ['game-engine', 'deck', 'combat', 'relic']) {
    vm.runInContext(fs.readFileSync('js/engine/' + name + '.js', 'utf8'), battleContext);
  }
  vm.runInContext(fs.readFileSync('js/ui/battle-ui.js', 'utf8'), battleContext);
  battleContext.GameEngine.init('warrior', 'mini', 'easy');
  battleContext.GameEngine.getState().map = [{type:'battle'}];
  battleContext.Combat.startBattle([{name:'致命敌人',hp:20,maxHp:20,damage:999,intents:['attack'],poison:0,burn:0,effects:{}}]);
  battleContext.GameEngine.on('playerDeath', () => { battleApp.innerHTML = 'DEATH_SCREEN'; });
  battleContext.BattleUI.refresh();
  battleElements['btn-end-turn'].listeners.click();
  test(battleApp.innerHTML === 'DEATH_SCREEN', 'death result is not overwritten by battle refresh');

  battleContext.GameEngine.init('warrior', 'mini', 'easy');
  battleContext.GameEngine.getState().map = [{type:'battle'}];
  battleContext.Combat.startBattle([
    {name:'已阵亡敌人',hp:0,maxHp:20,damage:0,intents:['attack'],poison:0,burn:0,effects:{}},
    {name:'存活敌人',hp:20,maxHp:20,damage:0,intents:['attack'],poison:0,burn:0,effects:{}}
  ]);
  battleContext.BattleUI.refresh();
  test(!battleApp.innerHTML.includes('已阵亡敌人'), 'dead enemies are not reinserted on refresh');
  test(battleApp.innerHTML.includes('存活敌人'), 'living enemies remain rendered');

  battleContext.GameEngine.init('rogue', 'mini', 'easy');
  battleContext.GameEngine.getState().map = [{type:'boss'}];
  battleContext.Combat.startBattle([
    {name:'中毒的最终敌人',hp:1,maxHp:20,damage:0,intents:['attack'],poison:1,burn:0,effects:{}}
  ]);
  battleContext.GameEngine.on('battleVictory', () => { battleApp.innerHTML = 'VICTORY_SCREEN'; });
  battleContext.BattleUI.refresh();
  battleElements['btn-end-turn'].listeners.click();
  test(battleApp.innerHTML === 'VICTORY_SCREEN', 'victory result is not overwritten after DOT kill');

  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed > 0 ? 1 : 0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});

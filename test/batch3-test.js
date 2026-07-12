// Batch 3 测试 — combat.js + relic.js
const fs = require('fs');
const vm = require('vm');

function loadAll() {
  const ctx = vm.createContext({ window: {} });
  for (const f of ['cards.js','enemies.js','relics.js','potions.js','events.js']) {
    vm.runInContext(fs.readFileSync('js/data/'+f,'utf8'), ctx);
  }
  vm.runInContext(fs.readFileSync('js/engine/game-engine.js','utf8'), ctx);
  vm.runInContext(fs.readFileSync('js/engine/deck.js','utf8'), ctx);
  vm.runInContext(fs.readFileSync('js/engine/combat.js','utf8'), ctx);
  vm.runInContext(fs.readFileSync('js/engine/relic.js','utf8'), ctx);
  return ctx.window;
}

let passed = 0, failed = 0;
function t(c,m) { if(c) passed++; else { failed++; console.log('FAIL: '+m); } }
function eq(a,b,m) { t(a===b, m+': '+a+' === '+b); }

const game = loadAll();
const GE = game.GameEngine;
const Combat = game.Combat;
const Relic = game.Relic;

console.log('--- combat.js: 伤害与护甲 ---');
GE.init('warrior','mini','easy');
Combat.startBattle([{ name:'骷髅兵', hp:20, maxHp:20, damage:6, intents:['attack'], intent:'attack', intentValue:6, effects:{}, poison:0, burn:0 }]);

// damage through armor
GE.setState('armor', 8);
Combat.dealDamageToPlayer(10);
eq(GE.getState().armor, 0, 'armor depleted');
eq(GE.getState().hp, 83, 'hp 85→83');

// armor stacking
GE.setState('armor', 0);
Combat.gainArmor(5);
Combat.gainArmor(7);
eq(GE.getState().armor, 12, 'armor 5+7=12');

// strength
GE.setState('strength', 3);
const dmg = Combat.calcDamage(6);
eq(dmg, 9, 'strength 3→6+3=9');

console.log('--- combat.js: 状态效果 ---');
GE.init('warrior','mini','easy');
Combat.startBattle([{ name:'测试怪', hp:30, maxHp:30, damage:10, intent:'attack', intentValue:10, effects:{}, poison:0, burn:0 }]);
const enemy = Combat.getEnemies()[0];

// poison
Combat.applyPoison(enemy, 5);
Combat.applyPoison(enemy, 4);
eq(enemy.poison, 9, 'poison 5+4=9');
Combat.tickDot(enemy);
eq(enemy.hp, 21, 'poison tick 9');
eq(enemy.poison, 9, 'poison unchanged');

// burn
Combat.applyBurn(enemy, 5);
eq(enemy.burn, 5, 'burn 5');
Combat.tickDot(enemy);
// tickDot applies poison(9)+burn(5)=14, hp was 21-14=7
eq(enemy.hp, 7, 'burn+poison tick');
eq(enemy.burn, 3, 'burn 5->3');

// weak
Combat.applyWeak(enemy, 2);
t(enemy.effects.weak > 0, 'weak applied');
const weakDmg = Combat.calcEnemyDamage(enemy);
eq(weakDmg, 5, 'weak halves dmg');

// vulnerable on player
GE.getState().effects = { vulnerable: 1 };
GE.setState('hp', 80);
Combat.dealDamageToPlayer(20);
eq(GE.getState().hp, 50, 'vuln +50%');

// frail
GE.getState().effects = { frail: 1 };
Combat.gainArmor(10);
eq(GE.getState().armor, 5, 'frail halves armor');

// stun
Combat.applyStun(enemy);
t(enemy.effects.stun, 'stun applied');

// status refresh
Combat.applyWeak(enemy, 3);
eq(enemy.effects.weak, 3, 'weak refreshed');

console.log('--- combat.js: DSL执行器 ---');
GE.init('warrior','mini','easy');
Combat.startBattle([{ name:'测试怪', hp:30, maxHp:30, damage:10, intent:'attack', intentValue:10, effects:{}, poison:0, burn:0 }]);
Combat.executeEffect({type:'damage',value:6}, Combat.getEnemies()[0]);
eq(Combat.getEnemies()[0].hp, 24, 'DSL damage');
Combat.executeEffect({type:'armor',value:5});
eq(GE.getState().armor, 5, 'DSL armor');
Combat.executeEffect({type:'strength',value:2});
eq(GE.getState().strength, 2, 'DSL strength');
Combat.executeEffect({type:'poison',layers:3}, Combat.getEnemies()[0]);
t(Combat.getEnemies()[0].poison === 3, 'DSL poison');
Combat.executeEffect({type:'nonexistent'});
t(true, 'unknown DSL no crash');

console.log('--- combat.js: 状态机 ---');
GE.init('warrior','mini','easy');
Combat.startBattle([{ name:'骷髅兵', hp:20, maxHp:20, damage:6, intents:['attack'], intent:'attack', intentValue:6, effects:{}, poison:0, burn:0 }]);
eq(Combat.getPhase(), 'PLAYER_TURN', 'start PLAYER_TURN');
Combat.endPlayerTurn();
// After enemy executes, should be DOT_PHASE or PLAYER_TURN
const phase = Combat.getPhase();
t(phase === 'DOT_PHASE' || phase === 'PLAYER_TURN', 'phase after turn');

console.log('--- relic.js: 钩子 ---');
GE.init('warrior','mini','easy');
GE.setState('relics', [{ id:'iron_ring', hook:'onBattleStart', effect:{armor:4} }]);
Combat.startBattle([{ name:'骷髅兵', hp:20, maxHp:20, damage:6, intent:'attack', intentValue:6, effects:{}}]);
// Already triggered by startBattle, skip manual call
eq(GE.getState().armor, 4, 'iron ring +4');

// phoenix
GE.setState('hp', 0);
GE.setState('relics', [{ id:'phoenix', name:'凤凰羽毛', hook:'onDeath', effect:{revivePercent:50} }]);
Relic.triggerHook('onDeath', {});
eq(GE.getState().hp, 42, 'phoenix revive 85*50%=42');

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);



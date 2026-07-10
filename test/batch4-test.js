// Batch 4 测试 — map.js
const fs = require('fs');
const vm = require('vm');

function loadAll() {
  const ctx = vm.createContext({ window: {} });
  for (const f of ['cards.js','enemies.js','relics.js','potions.js','events.js']) {
    vm.runInContext(fs.readFileSync('js/data/'+f,'utf8'), ctx);
  }
  vm.runInContext(fs.readFileSync('js/engine/game-engine.js','utf8'), ctx);
  vm.runInContext(fs.readFileSync('js/engine/map.js','utf8'), ctx);
  return ctx.window;
}

let passed = 0, failed = 0;
function t(c,m) { if(c) passed++; else { failed++; console.log('FAIL: '+m); } }
function eq(a,b,m) { t(a===b, m+': '+a+' === '+b); }

const game = loadAll();
const GE = game.GameEngine;
const Map = game.Map;

console.log('--- map.js ---');

// Mini mode: 1 chapter, 5-7 floors
GE.init('warrior', 'mini', 'easy');
const miniMap = Map.generateFullMap('mini');
t(miniMap.length === 1, 'mini has 1 chapter');
t(miniMap[0].nodes.length >= 5, 'mini >=5 nodes');
t(miniMap[0].nodes.length <= 7, 'mini <=7 nodes');

// Short mode: 2 chapters
const shortMap = Map.generateFullMap('short');
t(shortMap.length === 2, 'short has 2 chapters');

// Standard mode: 3 chapters  
const stdMap = Map.generateFullMap('standard');
t(stdMap.length === 3, 'standard has 3 chapters');

// BOSS frequency: mini every 4, short/standard every 3
const ch1Nodes = miniMap[0].nodes;
const bossPositions = ch1Nodes.filter(n => n.type === 'boss').map(n => n.floor);
for (const bp of bossPositions) {
  t(bp % 4 === 0 || bp === ch1Nodes.length, 'mini boss at floor '+bp+' (4n or last)');
}

const stdCh1 = stdMap[0].nodes;
const stdBossPos = stdCh1.filter(n => n.type === 'boss').map(n => n.floor);
for (const bp of stdBossPos) {
  t(bp % 3 === 0 || bp === stdCh1.length, 'standard boss at floor '+bp+' (3n or last)');
}

// Node types include correct types
const nodeTypes = new Set(ch1Nodes.map(n => n.type));
t(nodeTypes.has('battle'), 'has battle nodes');
t(nodeTypes.has('boss'), 'has boss nodes');

// getAvailablePaths
GE.init('warrior','mini','easy');
const map = Map.generateFullMap('mini')[0];
GE.getState().map = map.nodes;
GE.getState().currentNode = 2;
const paths = Map.getAvailablePaths(0);
t(paths.length >= 1, 'has available paths from node 0');

// advanceNode
Map.advanceNode(0);
eq(GE.getState().currentNode, 0, 'advanced to node 0');

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);

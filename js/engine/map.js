// 暗黑地牢卡牌爬塔 — 地图生成引擎
window.Map = (() => {
  const NODE_TYPES = ['battle', 'battle', 'battle', 'elite', 'chest', 'shop', 'rest', 'event', 'curse'];

  function generateFullMap(mode) {
    const chapters = mode === 'mini' ? 1 : mode === 'short' ? 2 : 3;
    const maps = [];
    for (let ch = 1; ch <= chapters; ch++) {
      maps.push(generateChapter(ch, mode));
    }
    return maps;
  }

  function generateChapter(chapter, mode) {
    const bossFreq = mode === 'mini' ? 4 : 3;
    let floors;
    if (mode === 'mini') floors = 5 + Math.floor(Math.random() * 3);       // 5-7
    else if (mode === 'short') floors = 4 + Math.floor(Math.random() * 3);  // 4-6 per chapter (8-12 total)
    else floors = 5 + Math.floor(Math.random() * 3);                        // 5-7 per chapter (15-21 total)

    const nodes = [];
    const bossPool = getBossPool(chapter);
    const usedBosses = window.GameEngine.getState()?.defeatedBossIds || [];
    const availableBosses = bossPool.filter(b => !usedBosses.includes(b));

    let bossesPlaced = 0;
    for (let f = 1; f <= floors; f++) {
      const isBossFloor = (f % bossFreq === 0 && f > 0) || f === floors;
      if (isBossFloor) {
        const boss = availableBosses[bossesPlaced % availableBosses.length];
        nodes.push({ floor: f, type: 'boss', bossId: boss, chapter });
        bossesPlaced++;
      } else {
        // Non-boss: pick random non-boss type
        const type = f === 1 ? 'battle' : NODE_TYPES[Math.floor(Math.random() * NODE_TYPES.length)];
        nodes.push({ floor: f, type, chapter });
      }
    }

    // Build a forward-only DAG. A node can offer several upcoming rooms, but
    // paths never jump over a boss so chapter progression remains mandatory.
    for (let i = 0; i < nodes.length - 1; i++) {
      const nextBossIndex = nodes.findIndex((node, idx) => idx > i && node.type === 'boss');
      const lastReachable = nextBossIndex >= 0 ? nextBossIndex : nodes.length - 1;
      const candidates = [];
      for (let idx = i + 1; idx <= Math.min(i + 3, lastReachable); idx++) candidates.push(idx);
      const branchCount = Math.min(candidates.length, 2 + Math.floor(Math.random() * 2));
      nodes[i].branches = candidates.slice(0, Math.max(1, branchCount));
    }
    nodes[nodes.length - 1].branches = [];

    return { chapter, nodes };
  }

  function getBossPool(chapter) {
    const bosses = window.ENEMIES['chapter' + chapter]?.boss || [];
    return bosses.map(b => b.name);
  }

  function getAvailablePaths(currentNodeIndex) {
    const nodes = window.GameEngine.getState()?.map || [];
    if (currentNodeIndex >= nodes.length - 1) return [];
    const node = nodes[currentNodeIndex];
    if (!node || !node.branches) return [];
    // Return unique next-floor nodes
    const uniqueBranches = [...new Set(node.branches)];
    return uniqueBranches.map(idx => nodes[idx]);
  }

  function advanceNode(nodeIndex) {
    const state = window.GameEngine.getState();
    state.currentNode = nodeIndex;
    const node = state.map[nodeIndex];
    state.floor = node.floor;
    window.GameEngine.emit('floorEnter', { floor: node.floor, node });
    window.GameEngine.save();
  }

  function completeCurrentNode() {
    const state = window.GameEngine.getState();
    if (!state || !state.map || !state.map[state.currentNode]) return false;
    state.pathTaken = state.pathTaken || [];
    if (!state.pathTaken.includes(state.currentNode)) state.pathTaken.push(state.currentNode);
    window.GameEngine.save();
    return true;
  }

  function isChapterEnd(node) {
    if (!node) return false;
    const state = window.GameEngine.getState();
    const mapForChapter = state.map;
    return node.type === 'boss' && node.floor === mapForChapter[mapForChapter.length - 1]?.floor;
  }

  return { generateFullMap, getAvailablePaths, advanceNode, completeCurrentNode, isChapterEnd };
})();

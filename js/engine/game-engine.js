// 暗黑地牢卡牌爬塔 — 核心引擎
// 事件总线 + 状态管理 + 初始化 + 存档

window.GameEngine = (() => {
  let _state = null;
  let _listeners = {};

  function emit(eventName, payload) {
    const handlers = _listeners[eventName] || [];
    handlers.forEach(fn => {
      try { fn(payload); } catch(e) { console.warn('Event handler error:', eventName, e); }
    });
  }

  function on(eventName, callback) {
    if (!_listeners[eventName]) _listeners[eventName] = [];
    _listeners[eventName].push(callback);
  }

  function off(eventName, callback) {
    if (!_listeners[eventName]) return;
    if (callback === null) { _listeners[eventName] = []; return; }
    _listeners[eventName] = _listeners[eventName].filter(fn => fn !== callback);
  }

  function getState() { return _state; }

  function setState(path, value) {
    if (!_state) return;
    // 支持嵌套路径，如 'player.hp'
    const parts = path.split('.');
    let obj = _state;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    emit('stateChanged', { path, value });
  }

  function init(cls, mode, difficulty) {
    const classConfig = {
      warrior: { hp: 85, maxHp: 85, energy: 3, starter: 'warrior' },
      mage:    { hp: 65, maxHp: 65, energy: 4, starter: 'mage'    },
      rogue:   { hp: 70, maxHp: 70, energy: 2, starter: 'rogue'   }
    };
    const cfg = classConfig[cls];
    if (!cfg) throw new Error('Invalid class: ' + cls);

    const starterIds = window.STARTER_DECKS[cfg.starter];
    const deck = starterIds.map(id => {
      const template = window.CARDS.find(c => c.id === id);
      return template ? JSON.parse(JSON.stringify(template)) : null;
    }).filter(Boolean);

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    _state = {
      saveVersion: 2,
      class: cls,
      mode: mode,
      difficulty: difficulty,
      chapter: 1,
      floor: 1,
      currentNode: 0,
      hp: cfg.hp,
      maxHp: cfg.maxHp,
      energy: cfg.energy,
      maxEnergy: cfg.energy,
      strength: 0,
      armor: 0,
      deck: deck,
      hand: [],
      discardPile: [],
      exhaustPile: [],
      relics: [],
      potions: [],
      map: [],
      pathTaken: [],
      enemiesDefeated: 0,
      bossesDefeated: 0,
      eventsEncountered: [],
      defeatedBossIds: [],
      enteringNewChapter: true,
      buffs: [],
      nextTurnEnergy: 0,
      retainArmor: false
    };

    emit('gameStart', { class: cls, mode, difficulty });
  }

  function save() { if (typeof localStorage === 'undefined') return false;
    try {
      const json = JSON.stringify(_state);
      localStorage.setItem('darkdungeon_save', json);
      return true;
    } catch(e) {
      console.warn('Save failed:', e);
      return false;
    }
  }

  function load() { if (typeof localStorage === 'undefined') return null;
    try {
      const json = localStorage.getItem('darkdungeon_save');
      if (!json) return null;
      _state = JSON.parse(json);
      // Version 1 marked a room complete as soon as it was entered. Reopen the
      // current room once so old saves cannot skip a failed BOSS encounter.
      if (!_state.saveVersion) {
        if (Array.isArray(_state.pathTaken)) {
          _state.pathTaken = _state.pathTaken.filter(index => index !== _state.currentNode);
        }
        _state.saveVersion = 2;
        localStorage.setItem('darkdungeon_save', JSON.stringify(_state));
      }
      emit('gameLoaded', { state: _state });
      return _state;
    } catch(e) {
      console.warn('Load failed, clearing corrupted save:', e);
      localStorage.removeItem('darkdungeon_save');
      return null;
    }
  }

  // 通用选牌/选遗物 UI（B2 提供接口，B5 shared.js 实现渲染）
  let _pendingPickerResolve = null;
  function showPicker(options, config) {
    return new Promise(resolve => {
      _pendingPickerResolve = resolve;
      emit('showPicker', { options, config, resolve });
    });
  }
  function resolvePicker(index) {
    if (_pendingPickerResolve) {
      _pendingPickerResolve(index);
      _pendingPickerResolve = null;
    }
  }

  return { init, getState, setState, emit, on, off, save, load, showPicker, resolvePicker };
})();


// 暗黑地牢卡牌爬塔 — 主菜单
window.Menu = (() => {
  let selectedMode = null;
  let selectedDifficulty = null;

  function show() {
    const app = document.getElementById('app');
    const hasSave = !!window.GameEngine.load();
    let bestScore = '0';
    let deaths = 0;
    let streak = 0;
    try {
      bestScore = localStorage.getItem('darkdungeon_bestscore') || '0';
      deaths = parseInt(localStorage.getItem('darkdungeon_deaths') || '0', 10);
      streak = parseInt(localStorage.getItem('darkdungeon_streak') || '0', 10);
    } catch (e) {}

    app.innerHTML = `
      <div class="menu-screen">
        <h1>暗黑地牢</h1>
        <div class="subtitle">卡牌爬塔</div>
        ${bestScore !== '0' ? `<div style="color:var(--gold);font-size:14px;margin-bottom:4px">🏆 最高分: ${bestScore}</div>` : ''}
        ${deaths > 0 ? `<div style="color:var(--text-dim);font-size:13px;margin-bottom:2px">💀 死亡: ${deaths}</div>` : ''}
        ${streak > 0 ? `<div style="color:var(--danger);font-size:14px;margin-bottom:12px">🔥 连胜: ${streak}</div>` : ''}
        <div class="menu-options">
          <button id="btn-new" class="btn-primary">新游戏</button>
          <button id="btn-continue" ${hasSave ? '' : 'disabled'}>继续游戏</button>
        </div>
        <div style="position:absolute;bottom:20px;right:20px">
          <button id="btn-settings" style="font-size:20px;padding:6px 10px;background:transparent;border:none;color:var(--text-dim)" title="设置">⚙</button>
        </div>
      </div>`;

    document.getElementById('btn-new').addEventListener('click', function(){
      if (hasSave && !confirm('当前有未完成的对局，开始新游戏将丢失进度。确定？')) return;
      showModeSelect();
    });
    if (hasSave) {
      document.getElementById('btn-continue').addEventListener('click', continueGame);
    }
    document.getElementById('btn-settings').addEventListener('click', showSettings);
  }

  function showModeSelect() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="menu-screen">
        <h1>选择模式</h1>
        <div class="menu-options">
          <button id="btn-mini">迷你（5-7层）</button>
          <button id="btn-short">短局（8-12层）</button>
          <button id="btn-standard">标准（15-20层）</button>
          <button id="btn-back">返回</button>
        </div>
      </div>
    `;
    document.getElementById('btn-mini').addEventListener('click', () => { selectedMode='mini'; showDifficultySelect(); });
    document.getElementById('btn-short').addEventListener('click', () => { selectedMode='short'; showDifficultySelect(); });
    document.getElementById('btn-standard').addEventListener('click', () => { selectedMode='standard'; showDifficultySelect(); });
    document.getElementById('btn-back').addEventListener('click', show);
  }

  function showDifficultySelect() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="menu-screen">
        <h1>选择难度</h1>
        <div class="difficulty-select">
          <button id="btn-easy">简单 <span class="diff-desc">— 敌人较弱，适合熟悉游戏</span></button>
          <button id="btn-normal">普通 <span class="diff-desc">— 标准挑战，适度压力</span></button>
          <button id="btn-hard">困难 <span class="diff-desc">— 敌人更强，每场战斗随机获得一种额外能力</span></button>
          <button id="btn-back">返回</button>
        </div>
      </div>
    `;
    document.getElementById('btn-easy').addEventListener('click', () => { selectedDifficulty='easy'; showClassSelect(); });
    document.getElementById('btn-normal').addEventListener('click', () => { selectedDifficulty='normal'; showClassSelect(); });
    document.getElementById('btn-hard').addEventListener('click', () => { selectedDifficulty='hard'; showClassSelect(); });
    document.getElementById('btn-back').addEventListener('click', showModeSelect);
  }

  function showClassSelect() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="menu-screen">
        <h1>选择职业</h1>
        <div class="class-select">
          <div class="class-card" id="cls-warrior">
            <h3>战士</h3>
            <p>铁壁与利刃，正面碾碎一切敌人。</p>
            <div class="stats">HP 85 | 能量 3</div>
          </div>
          <div class="class-card" id="cls-mage">
            <h3>法师</h3>
            <p>掌控元素之力，用智慧撕裂深渊。</p>
            <div class="stats">HP 65 | 能量 4</div>
          </div>
          <div class="class-card" id="cls-rogue">
            <h3>盗贼</h3>
            <p>来自阴影的刺客，毒刃之下没有活口。</p>
            <div class="stats">HP 70 | 能量 2</div>
          </div>
        </div>
        <button id="btn-back" style="margin-top:20px">返回</button>
      </div>
    `;
    document.getElementById('cls-warrior').addEventListener('click', () => startGame('warrior'));
    document.getElementById('cls-mage').addEventListener('click', () => startGame('mage'));
    document.getElementById('cls-rogue').addEventListener('click', () => startGame('rogue'));
    document.getElementById('btn-back').addEventListener('click', showDifficultySelect);
  }

  function startGame(cls) {
    window.GameEngine.init(cls, selectedMode, selectedDifficulty);
  }

  function showSettings() {
    const app = document.getElementById('app');
    let unlocks = {};
    try { unlocks = JSON.parse(localStorage.getItem('darkdungeon_unlocks') || '{}'); } catch (e) {}
    const classNames = { warrior: '战士', mage: '法师', rogue: '盗贼' };
    const unlocked = Object.keys(classNames).filter(cls => unlocks[cls]).map(cls => classNames[cls]);

    app.innerHTML = `
      <div class="menu-screen">
        <h1>设置</h1>
        <div style="background:var(--surface);border:1px solid var(--card-border);padding:18px;margin:16px 0;max-width:360px">
          <div style="color:var(--text-dim);font-size:13px;margin-bottom:8px">已完成职业</div>
          <div>${unlocked.length ? unlocked.join('、') : '暂无'}</div>
        </div>
        <div class="menu-options">
          <button id="btn-settings-back">返回</button>
          <button id="btn-reset-progress" style="color:var(--danger)">重置全部进度</button>
        </div>
      </div>`;

    document.getElementById('btn-settings-back').addEventListener('click', show);
    document.getElementById('btn-reset-progress').addEventListener('click', function() {
      if (!confirm('确定清除存档、战绩和解锁内容吗？此操作无法撤销。')) return;
      try {
        ['darkdungeon_save', 'darkdungeon_bestscore', 'darkdungeon_deaths', 'darkdungeon_streak', 'darkdungeon_unlocks', 'darkdungeon_tutorial']
          .forEach(key => localStorage.removeItem(key));
      } catch (e) {}
      show();
    });
  }

  function continueGame() {
    var state = window.GameEngine.load();
    if (!state) return;
    var classNames = {warrior:'战士', mage:'法师', rogue:'盗贼'};
    var chapterNames = ['','墓穴','深渊','王座之间'];
    var app = document.getElementById('app');
    app.innerHTML = '<div class="menu-screen">' +
      '<h1 style="font-size:28px">继续冒险</h1>' +
      '<div style="background:var(--surface);border:2px solid var(--accent);padding:20px;margin:20px 0;text-align:left">' +
      '<div style="font-size:20px;color:var(--accent);margin-bottom:8px">' + (classNames[state.class]||state.class) + '</div>' +
      '<div>HP: <span style="color:var(--danger)">' + state.hp + '/' + state.maxHp + '</span></div>' +
      '<div>第 ' + state.chapter + '章: ' + (chapterNames[state.chapter]||'') + ' 第' + state.floor + '层</div>' +
      '<div>牌组: ' + (state.deck?state.deck.length:0) + '张 | 遗物: ' + (state.relics?state.relics.length:0) + '个</div>' +
      '</div>' +
      '<button id="btn-resume" class="btn-primary">继续</button>' +
      '<button id="btn-cancel" style="margin-top:8px">返回</button></div>';
    document.getElementById('btn-resume').addEventListener('click', function(){
      window.GameEngine.emit('gameStart', {});
    });
    document.getElementById('btn-cancel').addEventListener('click', function(){ show(); });
  }

  return { show };
})();


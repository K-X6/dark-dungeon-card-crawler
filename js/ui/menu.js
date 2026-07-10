// 暗黑地牢卡牌爬塔 — 主菜单
window.Menu = (() => {
  let selectedMode = null;
  let selectedDifficulty = null;

  function show() {
    const app = document.getElementById('app');
    const hasSave = !!window.GameEngine.load();
    // If save was loaded, reset (we just checked existence)
    if (hasSave) window.GameEngine.load();

    app.innerHTML = `
      <div class="menu-screen">
        <h1>暗黑地牢</h1>
        <div class="subtitle">卡牌爬塔</div>
        <div class="menu-options">
          <button id="btn-new" class="btn-primary">新游戏</button>
          <button id="btn-continue" ${hasSave ? '' : 'disabled'}>继续游戏</button>
        </div>
      </div>
    `;

    document.getElementById('btn-new').addEventListener('click', showModeSelect);
    if (hasSave) {
      document.getElementById('btn-continue').addEventListener('click', continueGame);
    }
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
          <button id="btn-hard">困难 <span class="diff-desc">— 敌人更强且行为多变</span></button>
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
            <div class="stats">HP 80 | 能量 3</div>
          </div>
          <div class="class-card" id="cls-mage">
            <h3>法师</h3>
            <p>掌控元素之力，用智慧撕裂深渊。</p>
            <div class="stats">HP 60 | 能量 4</div>
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
    document.getElementById('app').innerHTML = '<div class="menu-screen"><h1>游戏开始...</h1></div>';
    window.GameEngine.emit('gameStart', { class: cls, mode: selectedMode, difficulty: selectedDifficulty });
  }

  function continueGame() {
    const state = window.GameEngine.load();
    if (state) {
      document.getElementById('app').innerHTML = '<div class="menu-screen"><h1>继续游戏...</h1></div>';
      window.GameEngine.emit('gameStart', { class: state.class, mode: state.mode, difficulty: state.difficulty });
    }
  }

  return { show };
})();

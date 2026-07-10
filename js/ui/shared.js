// 暗黑地牢卡牌爬塔 — 通用UI组件
window.UI = window.UI || {};

window.showPicker = function(options, config) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="overlay-content">
        <h2>${config.title || '选择'}</h2>
        <div class="picker-options">
          ${options.map((opt, i) => `
            <button class="picker-opt" data-index="${i}">${opt.label || opt.name || opt}</button>
          `).join('')}
          ${config.allowSkip !== false ? '<button class="picker-skip">跳过</button>' : ''}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.picker-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.remove();
        resolve(parseInt(btn.dataset.index));
      });
    });

    const skipBtn = overlay.querySelector('.picker-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        overlay.remove();
        resolve(-1);
      });
    }
  });
};

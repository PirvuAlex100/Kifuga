(function () {
  let dotsContainer = null;
  let dots = [];
  let styleEl = null;
  let currentMode = localStorage.getItem('kifuga_cursor') || 'kifuga';
  let mouseX = -100, mouseY = -100;
  let positions = [];
  const DOT_COUNT = 24;
  const STAGGER_MS = 6;
  let rafId = null;
  window.setCustomCursor = function (mode) {
    if (!['windows', 'kifuga', 'rainbow'].includes(mode)) return;
    if (mode === currentMode) return;
    currentMode = mode;
    localStorage.setItem('kifuga_cursor', mode);
    stopRainbow();
    removeKifugaCursor();
    if (mode === 'rainbow') {
      startRainbow();
    } else if (mode === 'kifuga') {
      applyKifugaCursor();
    }
  };
  function applyKifugaCursor() {
  if (!document.getElementById('kifuga-cursor-style')) {
    const s = document.createElement('style');
    s.id = 'kifuga-cursor-style';
    s.textContent = `
      * {
        cursor: url('/images/cursor.png'), auto !important;
      }
      button:hover,
      a:hover,
      input:hover,
      .mode-card:hover,
      [role="button"]:hover,
      #privacyToggle:hover,
      #settingsGearBtn:hover,
      .player-menu-trigger:hover,
      .change-name-btn:hover,
      .filter-pill:hover,
      #sendChatBtn:hover,
      #micToggleBtn:hover,
      #leaveRoomBtn:hover, #buzzBtn:hover {
        cursor: url('/images/pointer.png'), pointer !important;
      }
    `;
    document.head.appendChild(s);
  }
}
  function removeKifugaCursor() {
    const s = document.getElementById('kifuga-cursor-style');
    if (s) s.remove();
    document.body.style.cursor = '';
    document.documentElement.style.cursor = '';
  }
  function startRainbow() {
    if (dotsContainer) return;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.textContent = `* { cursor: none !important; }`;
      document.head.appendChild(styleEl);
    }
    dotsContainer = document.createElement('div');
    dotsContainer.id = 'kifuga-dots';
    dotsContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(dotsContainer);
    positions = new Array(DOT_COUNT).fill({ x: mouseX, y: mouseY });
    for (let i = 0; i < DOT_COUNT; i++) {
      const dot = document.createElement('div');
      const hue = (i * (360 / DOT_COUNT)) % 360;
      const scale = 1 - (i / DOT_COUNT) * 0.8;
      dot.style.cssText = `
        position: absolute;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        background-color: hsl(${hue}, 85%, 75%);
        transform: translate(-50%, -50%) scale(${scale});
        pointer-events: none;
        left: 0;
        top: 0;
        will-change: left, top;
      `;
      dotsContainer.appendChild(dot);
      dots.push({ el: dot, index: i });
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    rafId = requestAnimationFrame(updateLoop);
  }
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }
  function onTouchMove(e) {
    const touch = e.changedTouches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
  }
  function updateLoop() {
    positions.unshift({ x: mouseX, y: mouseY });
    if (positions.length > DOT_COUNT) positions.pop();
    dots.forEach((dot, i) => {
      const pos = positions[Math.min(i, positions.length - 1)];
      if (pos) {
        dot.el.style.left = pos.x + 'px';
        dot.el.style.top = pos.y + 'px';
      }
    });
    rafId = requestAnimationFrame(updateLoop);
  }
  function stopRainbow() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (dotsContainer) {
      dotsContainer.remove();
      dotsContainer = null;
      dots = [];
    }
    positions = [];
    if (styleEl) {
      styleEl.remove();
      styleEl = null;
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
  }
  if (currentMode === 'rainbow') {
    startRainbow();
  } else if (currentMode === 'kifuga') {
    applyKifugaCursor();
  }
})();
(function() {
  const hoverSound = new Audio('/sounds/general/hover.wav');
  hoverSound.volume = 0.4;
  const clickSound = new Audio('/sounds/general/pop.wav');
  clickSound.volume = 0.6;
  const bgMusic = new Audio('/sounds/general/music.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.15;
  const savedTime = sessionStorage.getItem('kifuga_music_time');
  if (savedTime && !isNaN(parseFloat(savedTime))) {
    bgMusic.currentTime = parseFloat(savedTime);
  }
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('kifuga_music_time', bgMusic.currentTime);
  });
  setInterval(() => {
    if (!bgMusic.paused) {
      sessionStorage.setItem('kifuga_music_time', bgMusic.currentTime);
    }
  }, 1000);
  let musicStarted = false;
  function startMusic() {
    if (musicStarted) return;
    bgMusic.play().catch(() => {});
    musicStarted = true;
  }
  document.addEventListener('click', startMusic, { once: true });
  document.addEventListener('keydown', startMusic, { once: true });
  function getButton(el) {
    if (!el || !el.closest) return null;
    return el.closest('button, [role="button"]');
  }
  document.addEventListener('mouseenter', (e) => {
    const btn = getButton(e.target);
    if (btn) {
      hoverSound.currentTime = 0;
      hoverSound.play().catch(() => {});
    }
  }, true);
  document.addEventListener('click', (e) => {
    const btn = getButton(e.target);
    if (btn) {
      clickSound.currentTime = 0;
      clickSound.play().catch(() => {});
    }
  }, true);
  window.bgMusic = bgMusic;
})();
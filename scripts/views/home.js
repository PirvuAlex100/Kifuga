function renderHomeView() {
  let currentMenu = null;
  let menuCloseHandler = null;
  function closeMenu() {
    if (currentMenu) {
      currentMenu.remove();
      currentMenu = null;
    }
    if (menuCloseHandler) {
      document.removeEventListener('click', menuCloseHandler);
      menuCloseHandler = null;
    }
  }
  function showHomeContextMenu(x, y) {
  closeMenu();
  const menu = document.createElement('div');
  menu.className = 'fixed bg-white rounded-2xl shadow-xl border border-navy/5 py-2 z-[100] min-w-[200px]';
  menu.style.left = Math.min(x, window.innerWidth - 210) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - 280) + 'px';
  menu.innerHTML = `
    <style>
      .hcm-item { position: relative; }
      .hcm-submenu {
        display: none;
        position: absolute;
        left: 100%;
        top: 0;
        margin-left: -4px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border: 1px solid rgba(0,0,0,0.05);
        padding: 8px 0;
        min-width: 160px;
        z-index: 101;
      }
      .hcm-item:hover .hcm-submenu { display: block; }
      .hcm-submenu button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        text-align: left;
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        transition: background 0.2s;
      }
      .hcm-submenu button:hover { background: #f7f5f0; }
    </style>
    <div class="hcm-item">
      <button class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition text-navy" style="display:flex;">
        <i class="fas fa-mouse-pointer w-4 text-center"></i> Cursor
        <i class="fas fa-chevron-right ml-auto text-xs text-navy/40"></i>
      </button>
      <div class="hcm-submenu">
        <button data-mode="windows" class="cursor-opt">
          <i class="fab fa-windows w-4 text-center" style="color:#0078D6;"></i> Windows
        </button>
        <button data-mode="kifuga" class="cursor-opt">
          <i class="fas fa-mouse-pointer w-4 text-center" style="color:#FF6B5E;"></i> Default
        </button>
        <button data-mode="rainbow" class="cursor-opt">
          <i class="fas fa-palette w-4 text-center" style="color:#FF6B5E;"></i> Colorful
        </button>
      </div>
    </div>
    <div class="hcm-item">
      <button class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition text-navy" style="display:flex;">
        <i class="fas fa-music w-4 text-center"></i> Music
        <i class="fas fa-chevron-right ml-auto text-xs text-navy/40"></i>
      </button>
      <div class="hcm-submenu" style="min-width:140px;">
        <button id="hcmMusicMute">
          <i class="fas fa-volume-mute w-4 text-center text-softred"></i> Mute
        </button>
        <button id="hcmMusicUnmute">
          <i class="fas fa-volume-up w-4 text-center text-softgreen"></i> Unmute
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(menu);
  currentMenu = menu;
  menu.querySelectorAll('.cursor-opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.setCustomCursor) window.setCustomCursor(btn.dataset.mode);
      closeMenu();
    });
  });
  const muteBtn = menu.querySelector('#hcmMusicMute');
  const unmuteBtn = menu.querySelector('#hcmMusicUnmute');
  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.bgMusic) window.bgMusic.pause();
      closeMenu();
    });
  }
  if (unmuteBtn) {
    unmuteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.bgMusic) window.bgMusic.play().catch(() => {});
      closeMenu();
    });
  }
  menuCloseHandler = function(e) {
    if (!menu.contains(e.target)) closeMenu();
  };
  document.addEventListener('click', menuCloseHandler);
}
  document.addEventListener('contextmenu', (e) => {
    if (document.getElementById('app') && !document.getElementById('app').classList.contains('h-screen')) {
      e.preventDefault();
      showHomeContextMenu(e.clientX, e.clientY);
    }
  });
  document.body.classList.add('overflow-x-hidden');
  document.body.classList.remove('h-screen', 'overflow-hidden');
  const app = document.getElementById('app');
  app.className = '';
  let lastRoomList = [];
  const socket = window.socket;
  function getGameDisplayName(id) {
    const names = {
      'search-engine': 'Human Search',
      'impostor': 'Impostor Chat',
      'best-answer': 'Best Answer',
      'buzz-battle': 'Buzz Battle',
      'story-chain': 'Story Chain',
      'scribble': 'Scribble'
    };
    return names[id] || id;
  }
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  function renderRoomList(rooms) {
    const container = document.getElementById('roomListContainer');
    if (!container) return;
    const searchTerm = document.getElementById('roomSearchInput')?.value?.toLowerCase() || '';
    const filtered = rooms.filter(room =>
      room.roomName.toLowerCase().includes(searchTerm) ||
      room.hostName.toLowerCase().includes(searchTerm) ||
      room.code.toLowerCase().includes(searchTerm)
    );
    if (filtered.length === 0) {
      container.innerHTML = '<p class="text-navy/40 text-center py-8">No public rooms found <kfg-svg name="sad" size="32" color="#4A5568" style="opacity:0.7;"></kfg-svg></p>';
      return;
    }
    container.innerHTML = filtered.map(room => `
      <div class="room-card bg-warm/60 hover:bg-warm rounded-xl p-4 flex items-center justify-between transition cursor-pointer" data-code="${room.code}">
        <div class="flex-1">
          <h3 class="font-semibold text-navy text-base">${escapeHtml(room.roomName)}</h3>
          <p class="text-xs text-navy/50">Host: ${escapeHtml(room.hostName)}</p>
          <span class="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${room.currentGame === 'lobby' ? 'bg-navy/10 text-navy/60' : 'bg-coral/10 text-coral'}">
            ${room.currentGame === 'lobby' ? 'Lobby' : getGameDisplayName(room.currentGame)}
          </span>
        </div>
        <div class="flex items-center gap-2 text-sm text-navy/60 ml-4">
          <i class="fas fa-user text-coral"></i>
          <span>${room.playerCount}/${room.maxPlayers}</span>
        </div>
      </div>
    `).join('');
    container.querySelectorAll('.room-card').forEach(card => {
      card.addEventListener('click', () => {
        const code = card.dataset.code;
        document.getElementById('roomBrowserModal').classList.add('hidden');
        navigateTo('/room?code=' + code);
      });
    });
  }
  socket.on('roomList', (rooms) => {
    lastRoomList = rooms;
    renderRoomList(rooms);
  });
  app.innerHTML = `
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-coral text-white px-4 py-2 rounded-full z-50">Skip to content</a>
    <main id="main-content" class="flex-1 relative">
      <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div class="bubble w-24 h-24 bg-[#E53935]/20 top-[8%] left-[5%] animate-float" style="animation-delay: 0s;"></div>
        <div class="bubble w-16 h-16 bg-[#FDD835]/25 top-[15%] right-[10%] animate-float-slow" style="animation-delay: 1.5s;"></div>
        <div class="bubble w-20 h-20 bg-[#1E88E5]/20 top-[25%] left-[25%] animate-float-fast" style="animation-delay: 0.8s;"></div>
        <div class="bubble w-28 h-28 bg-[#26A69A]/15 bottom-[20%] left-[8%] animate-float" style="animation-delay: 2.2s;"></div>
        <div class="bubble w-14 h-14 bg-[#F48FB1]/25 top-[40%] right-[20%] animate-float-slow" style="animation-delay: 0.3s;"></div>
        <div class="bubble w-32 h-32 bg-[#FB8C00]/15 bottom-[10%] right-[5%] animate-float" style="animation-delay: 1.8s;"></div>
        <div class="bubble w-18 h-18 bg-[#E53935]/15 top-[60%] left-[15%] animate-float-slow" style="animation-delay: 0.6s;"></div>
        <div class="bubble w-22 h-22 bg-[#FDD835]/20 top-[70%] right-[30%] animate-float-fast" style="animation-delay: 1.1s;"></div>
        <div class="bubble w-10 h-10 bg-[#1E88E5]/30 top-[10%] right-[50%] animate-float" style="animation-delay: 2.5s;"></div>
        <div class="bubble w-36 h-36 bg-[#26A69A]/12 bottom-[30%] left-[40%] animate-float-slow" style="animation-delay: 0.2s;"></div>
        <div class="bubble w-12 h-12 bg-[#F48FB1]/30 top-[55%] left-[70%] animate-float" style="animation-delay: 1.4s;"></div>
        <div class="bubble w-26 h-26 bg-[#FB8C00]/20 top-[35%] left-[50%] animate-float-fast" style="animation-delay: 0.9s;"></div>
        <div class="bubble w-15 h-15 bg-[#E53935]/25 bottom-[40%] right-[15%] animate-float" style="animation-delay: 1.7s;"></div>
        <div class="bubble w-30 h-30 bg-[#FDD835]/10 bottom-[5%] left-[60%] animate-float-slow" style="animation-delay: 0.5s;"></div>
        <div class="bubble w-8 h-8 bg-[#1E88E5]/35 top-[75%] right-[10%] animate-float" style="animation-delay: 2.0s;"></div>
      </div>
      <section class="relative px-4 pt-16 pb-12 md:pt-24 md:pb-16 flex flex-col items-center text-center">
        <h1 class="text-6xl md:text-8xl lg:text-9xl font-display tracking-tight select-none mb-3 animate-fade-up relative z-10">
          <span class="logo-letter logo-k">K</span><span class="logo-letter logo-i">i</span><span class="logo-letter logo-f">f</span><span class="logo-letter logo-u">u</span><span class="logo-letter logo-g">g</span><span class="logo-letter logo-a">a</span>
        </h1>
        <p class="text-xl md:text-2xl font-semibold text-navy/80 mb-2 animate-fade-up relative z-10" style="animation-delay: 0.15s;">
          <span style="color: #E53935">Kind</span> <span style="color: #1E88E5">Funny</span> <span style="color:#F48FB1">Games</span>
        </p>
        <p class="text-base md:text-lg text-navy/60 max-w-xl mb-10 animate-fade-up relative z-10" style="animation-delay: 0.25s;">
          Have free fun with your friends or with strangers
        </p>
        <div class="flex flex-wrap gap-4 justify-center animate-fade-up relative z-10" style="animation-delay: 0.4s;">
          <button id="createRoomBtn" class="btn-play bg-coral hover:bg-coral/90 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transition flex items-center gap-2">
            <i class="fas fa-plus-circle"></i> Create a Room
          </button>
          <button id="browseRoomsBtn" class="bg-white hover:bg-warm text-navy font-semibold text-lg px-8 py-4 rounded-full border-2 border-navy/20 transition flex items-center gap-2 shadow-md hover:shadow-lg">
            <i class="fas fa-search"></i> Join a Room
          </button>
        </div>
        <p class="text-sm text-navy/40 mt-6 animate-fade-up relative z-10" style="animation-delay: 0.55s;">
          No account needed
        </p>
      </section>
      <section class="py-12 md:py-16 px-4 max-w-5xl mx-auto relative z-10">
        <h2 class="text-3xl md:text-4xl font-display text-center mb-10 text-navy/85">How it works</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="flex flex-col items-center text-center p-4">
            <div class="text-5xl text-coral mb-4"><i class="fas fa-user-friends"></i></div>
            <h3 class="text-xl font-bold mb-2">1. Gather</h3>
            <p class="text-navy/70">Create a room and share the invitation code with friends, or join an open lobby.</p>
          </div>
          <div class="flex flex-col items-center text-center p-4">
            <div class="text-5xl text-softblue mb-4"><i class="fas fa-dice-d6"></i></div>
            <h3 class="text-xl font-bold mb-2">2. Pick a game</h3>
            <p class="text-navy/70">Choose from many game modes or let the other players decide.</p>
          </div>
          <div class="flex flex-col items-center text-center p-4">
            <div class="text-5xl text-softgreen mb-4"><i class="fas fa-laugh-beam"></i></div>
            <h3 class="text-xl font-bold mb-2">3. Laugh</h3>
            <p class="text-navy/70">Forget the rules. Be silly, be goofy, and remember: there's no wrong answer here.</p>
          </div>
        </div>
      </section>
      <section class="py-12 md:py-16 px-4 bg-warm/50 relative z-10">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-display text-center mb-4 text-navy/85">Many ways to play</h2>
          <p class="text-center text-navy/60 mb-10 max-w-2xl mx-auto">You can play with your friends, family, or even strangers!</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="mode-card card-enter bg-white rounded-2xl p-6 shadow-md flex flex-col items-start">
              <div class="text-4xl mb-3 text-coral"><i class="fas fa-search"></i></div>
              <h3 class="text-xl font-bold mb-2">Human Search Engine</h3>
              <p class="text-navy/70 text-sm flex-1">One player becomes a live search engine. The other asks anything.</p>
              <span class="inline-block mt-3 text-xs font-semibold bg-coral/10 text-coral px-3 py-1 rounded-full">1v1</span>
            </div>
            <div class="mode-card card-enter bg-white rounded-2xl p-6 shadow-md flex flex-col items-start">
              <div class="text-4xl mb-3 text-softpurple"><i class="fas fa-robot"></i></div>
              <h3 class="text-xl font-bold mb-2">Impostor in the Chat</h3>
              <p class="text-navy/70 text-sm flex-1">A hidden AI joins your group chat. Spot the bot before it fools everyone.</p>
              <span class="inline-block mt-3 text-xs font-semibold bg-softpurple/10 text-softpurple px-3 py-1 rounded-full">3‑5 players</span>
            </div>
            <div class="mode-card card-enter bg-white rounded-2xl p-6 shadow-md flex flex-col items-start">
              <div class="text-4xl mb-3 text-softyellow"><i class="fas fa-trophy"></i></div>
              <h3 class="text-xl font-bold mb-2">Best Answer Wins</h3>
              <p class="text-navy/70 text-sm flex-1">A random question drops. Everyone writes their best answer, then you vote.</p>
              <span class="inline-block mt-3 text-xs font-semibold bg-softyellow/20 text-amber-700 px-3 py-1 rounded-full">3‑5 players</span>
            </div>
            <div class="mode-card card-enter bg-white rounded-2xl p-6 shadow-md flex flex-col items-start">
              <div class="text-4xl mb-3 text-softred"><i class="fas fa-bell"></i></div>
              <h3 class="text-xl font-bold mb-2">Buzz Battle</h3>
              <p class="text-navy/70 text-sm flex-1">Trivia game. Buzz in first to answer. If you get it wrong, you lose a point and the next in line gets a shot. 10 seconds to answer.</p>
              <span class="inline-block mt-3 text-xs font-semibold bg-softred/10 text-softred px-3 py-1 rounded-full">2+ players</span>
            </div>
            <div class="mode-card card-enter bg-white rounded-2xl p-6 shadow-md flex flex-col items-start">
              <div class="text-4xl mb-3 text-softblue"><i class="fas fa-feather-alt"></i></div>
              <h3 class="text-xl font-bold mb-2">Story Chain</h3>
              <p class="text-navy/70 text-sm flex-1">Build a story together, line by line. Add a genre tag if you like.</p>
              <span class="inline-block mt-3 text-xs font-semibold bg-softblue/10 text-softblue px-3 py-1 rounded-full">3‑5 players</span>
            </div>
            <div class="mode-card card-enter bg-white rounded-2xl p-6 shadow-md flex flex-col items-start">
              <div class="text-4xl mb-3 text-teal"><i class="fas fa-paint-brush"></i></div>
              <h3 class="text-xl font-bold mb-2">Scribble</h3>
              <p class="text-navy/70 text-sm flex-1">Draw and guess! One player sketches while the other races to guess the word.</p>
              <span class="inline-block mt-3 text-xs font-semibold bg-teal/10 text-teal px-3 py-1 rounded-full">2‑5 players</span>
            </div>
          </div>
        </div>
      </section>
      <section class="py-8 px-4 max-w-3xl mx-auto text-center relative z-10">
        <p class="text-lg md:text-xl font-display text-navy/40">
          <kfg-svg name="sparkle" size="20" color="#F4C542" style="display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></kfg-svg> More game modes coming soon! <kfg-svg name="sparkle" size="20" color="#F4C542" style="display: inline-block; vertical-align: middle; margin-left: 0.5rem;"></kfg-svg>
        </p>
      </section>
      <section class="py-12 md:py-16 px-4 max-w-3xl mx-auto text-center relative z-10">
        <blockquote class="text-xl md:text-2xl italic font-semibold text-navy/70 leading-relaxed">
          "I believe in human connection." <br />
          <span class="text-base font-normal not-italic text-navy/50 mt-2 block">— Pîrvu Alex Vasile</span>
        </blockquote>
        <div class="mt-6 flex justify-center gap-3 text-3xl text-navy/30">
          <i class="fas fa-heart" style="color: #ff0000; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);"></i>
          <i class="fas fa-smile-wink" style="color: #F2D705; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);"></i>
          <i class="fas fa-star" style="color: yellow; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);"></i>
        </div>
      </section>
    </main>
    <footer class="bg-navy/5 backdrop-blur-sm py-8 px-4 mt-auto relative z-10">
      <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-navy/60">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-display text-lg text-navy/70 select-none">
            <span class="logo-letter logo-k text-base">K</span><span class="logo-letter logo-i text-base">i</span><span class="logo-letter logo-f text-base">f</span><span class="logo-letter logo-u text-base">u</span><span class="logo-letter logo-g text-base">g</span><span class="logo-letter logo-a text-base">a</span>
          </span>
          <span class="hidden md:inline mx-2">•</span>
          <span>Kind. Funny. Games.</span>
        </div>
        <p class="flex items-center gap-1 flex-wrap justify-center">
          <i class="fas fa-hand-peace text-coral"></i>
          Made with love for everyone.
        </p>
      </div>
    </footer>
    <div id="roomBrowserModal" class="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-50 hidden">
      <div class="bg-white rounded-3xl shadow-2xl flex flex-col animate-pop" style="width: 90vw; height: 90vh; max-width: 1000px;">
        <div class="flex items-center justify-between p-6 border-b border-navy/5 shrink-0">
          <h2 class="text-2xl font-display text-navy">Public Rooms</h2>
          <button id="closeBrowserBtn" class="text-navy/50 hover:text-softred transition text-2xl leading-none">&times;</button>
        </div>
        <div class="px-6 py-4 flex flex-wrap gap-3 items-center shrink-0">
          <div class="relative flex-1 min-w-[200px]">
            <input type="text" id="roomSearchInput" placeholder="Search rooms..." class="w-full bg-warm/80 border-2 border-navy/10 rounded-full px-5 py-3 pl-12 text-sm focus:outline-none focus:border-coral/50 transition" />
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-navy/40"></i>
          </div>
          <div class="relative flex-1 min-w-[150px]">
  <input type="text" id="roomCodeInput" placeholder="Invitation Code..." maxlength="6"
         class="w-full bg-warm/80 border-2 border-navy/10 rounded-full px-5 py-3 pl-10 text-sm focus:outline-none focus:border-coral/50 transition uppercase" />
  <i class="fas fa-ticket absolute left-4 top-1/2 -translate-y-1/2 text-navy/40"></i>
</div>
<button id="joinByCodeBtn" class="bg-coral hover:bg-coral/90 text-white font-semibold px-5 py-3 rounded-full transition flex items-center gap-2 shadow-md">
  <i class="fas fa-sign-in-alt"></i> Join
</button>
          <button id="refreshRoomsBtn" class="bg-white border border-navy/10 hover:bg-warm text-navy font-semibold px-4 py-3 rounded-full transition flex items-center gap-2">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
          <button id="quickJoinBtn" class="bg-softgreen/20 hover:bg-softgreen/30 text-softgreen font-semibold px-4 py-3 rounded-full transition flex items-center gap-2">
            <i class="fas fa-bolt"></i> Quick Join
          </button>
          <button id="createFromBrowserBtn" class="bg-coral hover:bg-coral/90 text-white font-semibold px-5 py-3 rounded-full transition flex items-center gap-2 shadow-md">
            <i class="fas fa-plus-circle"></i> Create
          </button>
        </div>
        <div id="roomListContainer" class="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          <p class="text-navy/40 text-center py-8">Loading rooms...</p>
        </div>
      </div>
    </div>
  `;
  document.getElementById('createRoomBtn').addEventListener('click', () => navigateTo('/room'));
  document.getElementById('browseRoomsBtn').addEventListener('click', () => {
    document.getElementById('roomBrowserModal').classList.remove('hidden');
    socket.emit('requestRoomList');
  });
  document.getElementById('closeBrowserBtn').addEventListener('click', () => document.getElementById('roomBrowserModal').classList.add('hidden'));
  document.getElementById('roomBrowserModal').addEventListener('click', (e) => {
    if (e.target.id === 'roomBrowserModal') document.getElementById('roomBrowserModal').classList.add('hidden');
  });
  document.getElementById('refreshRoomsBtn').addEventListener('click', () => socket.emit('requestRoomList'));
  document.getElementById('quickJoinBtn').addEventListener('click', () => {
    const cards = document.querySelectorAll('.room-card');
    if (cards.length === 0) return;
    const code = cards[Math.floor(Math.random() * cards.length)].dataset.code;
    navigateTo('/room?code=' + code);
  });
  document.getElementById('createFromBrowserBtn').addEventListener('click', () => {
    document.getElementById('roomBrowserModal').classList.add('hidden');
    navigateTo('/room');
  });
  document.getElementById('joinByCodeBtn').addEventListener('click', () => {
  const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
  if (code) navigateTo('/room?code=' + code);
});
document.getElementById('roomCodeInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (code) navigateTo('/room?code=' + code);
  }
});
  document.getElementById('roomSearchInput').addEventListener('input', () => renderRoomList(lastRoomList));
  const cards = document.querySelectorAll('.card-enter');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });
  cards.forEach(card => observer.observe(card));
}
export { renderHomeView };
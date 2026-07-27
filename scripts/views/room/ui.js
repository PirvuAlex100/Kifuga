function renderRoomHTML() {
  return `
    <div id="nameModal" class="fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-50">
  <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
    <div class="text-5xl mb-4 text-coral">
      <kfg-svg name="welcome" size="48" color="#F4C542" style="position: relative; left: 0.25rem;"></kfg-svg>
      <kfg-svg name="smiley" size="48" color="#F4C542" style="position: relative; left: -0.25rem;"></kfg-svg>
    </div>
    <h2 class="text-xl font-display text-navy mb-2">Welcome!</h2>
    <p class="text-navy/60 text-sm mb-6">Pick a display name to join the room.</p>
    <input type="text" id="nameInput" placeholder="Your name" maxlength="20"
           class="w-full bg-warm/80 border-2 border-navy/10 rounded-full px-5 py-3 text-sm text-center focus:outline-none focus:border-coral/50 transition mb-4" />
    <div id="roomNameField" class="hidden mb-4">
      <input type="text" id="roomNameInput" placeholder="Room name" maxlength="30"
             class="w-full bg-warm/80 border-2 border-navy/10 rounded-full px-5 py-3 text-sm text-center focus:outline-none focus:border-coral/50 transition" />
    </div>
    <button id="nameSubmitBtn" class="bg-coral hover:bg-coral/90 text-white font-bold px-8 py-3 rounded-full transition shadow-md w-full">
      Join Room <i class="fas fa-arrow-right ml-2"></i>
    </button>
  </div>
</div>
    <header class="bg-white/80 backdrop-blur-md border-b border-navy/5 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
      <div class="flex items-center gap-3">
        <a href="/" class="font-display text-xl select-none" onclick="event.preventDefault(); navigateTo('/');">
          <span class="logo-letter logo-k">K</span><span class="logo-letter logo-i">i</span><span class="logo-letter logo-f">f</span><span class="logo-letter logo-u">u</span><span class="logo-letter logo-g">g</span><span class="logo-letter logo-a">a</span>
        </a>
        <span class="hidden sm:inline text-navy/40 mx-1">|</span>
        <div class="flex items-center gap-2 bg-warm/80 rounded-full px-3 py-1 text-sm font-semibold text-navy/70">
          <i class="fas fa-link text-xs text-coral"></i>
          <span id="roomCode" class="select-all">ABC123</span>
          <button id="copyCodeBtn" class="text-navy/50 hover:text-coral transition" title="Copy room code">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div id="privacyToggle" class="items-center gap-2 bg-warm/80 rounded-full px-3 py-1 text-sm font-semibold text-navy/70 cursor-pointer" title="Toggle room privacy">
  <i id="privacyIcon" class="fas fa-globe text-xs text-softgreen"></i>
<span id="privacyLabel">Listed</span>
</div>
      </div>
      <div class="flex items-center gap-3">
                <div class="flex items-center gap-1 text-sm text-navy/60 bg-warm/60 rounded-full px-3 py-1">
          <i class="fas fa-user text-coral"></i>
          <span id="playerCount">1</span>
          <span class="text-navy/40">/</span>
          <span id="maxPlayersDisplay">5</span>
          <select id="maxPlayersSelect" class="hidden bg-transparent text-navy/60 text-sm font-normal border-none focus:outline-none cursor-pointer ml-0.5">
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5" selected>5</option>
</select>
        </div>
        <button id="leaveRoomBtn" class="text-navy/50 hover:text-softred transition text-sm font-semibold flex items-center gap-1">
          <i class="fas fa-sign-out-alt"></i> <span class="hidden sm:inline">Leave</span>
        </button>
      </div>
    </header>
    <div class="flex flex-1 overflow-hidden">
      <aside class="w-64 bg-white/70 backdrop-blur-sm border-r border-navy/5 flex flex-col shrink-0 hidden md:flex">
        <div class="px-4 py-3 border-b border-navy/5 font-semibold text-sm text-navy/60 flex items-center gap-2">
          <i class="fas fa-users text-coral"></i> Players
        </div>
        <ul id="playerList" class="flex-1 overflow-y-auto p-3 space-y-2"></ul>
        <div class="px-4 py-3 border-t border-navy/5 text-xs text-navy/40" id="sidebarFooter">
          <div class="text-center">
            <i class="fas fa-shield-alt mr-1"></i> host can kick/mute
          </div>
        </div>
      </aside>
      <main class="flex-1 flex flex-col overflow-hidden bg-cream/50">
        <div id="lobbyState" class="flex-1 flex flex-col p-4 md:p-6 animate-fade-up">
          <div id="chatArea" class="flex-1 bg-white/90 rounded-2xl p-4 shadow-inner overflow-y-auto chat-area mb-4 space-y-3">
            <div class="text-center text-navy/30 text-sm py-8">
              <i class="fas fa-comments text-3xl mb-2 block"></i>
              Chat is empty. Say hi!
            </div>
          </div>
          <div class="flex gap-2 mb-2">
            <input type="text" id="chatInput" placeholder="Type a message..."
                   class="flex-1 bg-white border-2 border-navy/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-coral/50 transition" />
            <button id="sendChatBtn" class="bg-coral hover:bg-coral/90 text-white rounded-full w-12 h-12 flex items-center justify-center transition shadow-md">
              <i class="fas fa-paper-plane"></i>
            </button>
            <button id="micToggleBtn" class="bg-white border-2 border-navy/10 hover:border-coral/50 text-navy/50 rounded-full w-12 h-12 flex items-center justify-center transition" title="Toggle microphone">
              <i class="fas fa-microphone"></i>
            </button>
          </div>
          <div id="typingIndicator" class="text-xs text-navy/40 italic px-2 h-5 mb-2"></div>
          <div class="border-t border-navy/5 pt-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-navy/70 text-sm flex items-center gap-2">
                <i class="fas fa-gamepad text-coral"></i> Pick a game
              </h3>
              <span class="text-xs text-navy/40">Host only</span>
            </div>
            <div class="flex items-center gap-2 mb-3">
              <div class="relative flex-1">
                <input type="text" id="gameSearchInput" placeholder="Search games..."
                       class="w-full bg-white border-2 border-navy/10 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:border-coral/50 transition" />
                <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40 text-sm"></i>
              </div>
              <button id="toggleFilterBtn" class="bg-white border border-navy/10 hover:bg-warm text-navy rounded-full w-8 h-8 flex items-center justify-center transition shrink-0">
                <i class="fas fa-filter text-xs"></i>
              </button>
              <button id="scrollLeftBtn" class="bg-white border border-navy/10 hover:bg-warm text-navy rounded-full w-8 h-8 flex items-center justify-center transition shrink-0">
                <i class="fas fa-chevron-left text-xs"></i>
              </button>
              <button id="scrollRightBtn" class="bg-white border border-navy/10 hover:bg-warm text-navy rounded-full w-8 h-8 flex items-center justify-center transition shrink-0">
                <i class="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
            <div id="filterPillsContainer" class="hidden flex flex-wrap items-center gap-2 mb-3">
              <span class="text-xs text-navy/50 mr-1">Competitiveness:</span>
              <button class="filter-pill active" data-filter="competitive">Competitive</button>
              <button class="filter-pill active" data-filter="casual">Casual</button>
              <span class="text-xs text-navy/50 ml-3 mr-1">Players:</span>
              <button class="filter-pill active" data-filter="1v1">1v1</button>
              <button class="filter-pill active" data-filter="2+">2+</button>
              <button class="filter-pill active" data-filter="3-5">3‑5</button>
            </div>
            <div id="gameCardsWrapper" class="overflow-x-auto scrollbar-hide">
              <div id="gameCardsGrid" class="flex gap-3 pb-2" style="min-width: max-content;"></div>
            </div>
            <p class="text-xs text-navy/40 mt-3 text-center">
              <i class="fas fa-info-circle mr-1"></i> Game starts when host selects a mode and enough players are ready.
            </p>
          </div>
        </div>
        <div id="gameState" class="flex-1 flex flex-col items-center justify-center p-4 md:p-6 hidden">
        </div>
      </main>
    </div>
    <button id="mobilePlayersBtn" class="md:hidden fixed bottom-6 right-6 bg-coral text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-20 text-xl">
      <i class="fas fa-users"></i>
    </button>
  `;
}
function updatePlayerList(players, socket, isHost) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const list = document.getElementById('playerList');
  if (!list) return;
  list.innerHTML = sorted.map(p => `
    <li class="flex items-center gap-2 p-2 rounded-xl bg-warm/70 text-sm relative" data-player-id="${p.id}">
      <div class="relative">
        <div class="w-7 h-7 rounded-full bg-coral/20 text-coral flex items-center justify-center text-xs font-bold">
          ${p.name.charAt(0).toUpperCase()}
        </div>
        ${p.isHost ? `<kfg-svg name="crown" size="20" color="#F4C542" class="absolute" style="right: 0.2rem; top: -0.9rem;"></kfg-svg>` : ''}
      </div>
      <span class="flex-1 font-semibold">
        ${p.name}${p.id === socket.id ? ' (You)' : ''}${p.muted ? ' <i class="fas fa-microphone-slash text-navy/30 ml-1 text-xs"></i>' : ''}
      </span>
      <span class="ml-auto text-xs font-bold text-softyellow bg-softyellow/10 px-2 py-0.5 rounded-full flex items-center gap-1">
        <i class="fas fa-star text-[10px]"></i> ${p.score || 0}
      </span>
      ${(isHost && p.id !== socket.id) ? `
        <button class="player-menu-trigger text-navy/40 hover:text-navy transition ml-1 p-1" data-player-id="${p.id}">
          <i class="fas fa-ellipsis-v text-xs"></i>
        </button>` : ''}
      ${(p.id === socket.id) ? `
        <button class="change-name-btn ml-auto text-navy/40 hover:text-coral transition" title="Change username">
          <i class="fas fa-pencil-alt text-xs"></i>
        </button>` : ''}
    </li>
  `).join('');
  list.querySelectorAll('.player-menu-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = btn.getBoundingClientRect();
      const event = new CustomEvent('openPlayerMenu', {
        detail: { playerId: btn.dataset.playerId, x: rect.left, y: rect.bottom + 4 }
      });
      document.dispatchEvent(event);
    });
  });
  list.querySelectorAll('.change-name-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent('openChangeNameModal'));
    });
  });
}
function showToast(message) {
  const existing = document.getElementById('kifugaToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'kifugaToast';
  toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl z-[90] animate-fade-up flex items-center gap-2';
  toast.innerHTML = `<i class="fas fa-gamepad text-white/70"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
export { renderRoomHTML, updatePlayerList, showToast, escapeHtml };
import { showToast } from './ui.js';
function setupModals(socket) {
  createAllModals();
  bindModalEvents(socket);
  bindGlobalModalListeners(socket);
}
function createAllModals() {
  if (!document.getElementById('leaveModal')) {
    const leaveModal = document.createElement('div');
    leaveModal.id = 'leaveModal';
    leaveModal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[60] hidden';
    leaveModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4 text-softred"><i class="fas fa-sign-out-alt"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">Leave Room?</h2>
        <p class="text-navy/60 text-sm mb-6">You'll need an invite code to rejoin.</p>
        <div class="flex gap-3">
          <button id="leaveCancelBtn" class="flex-1 bg-navy/10 hover:bg-navy/20 text-navy font-semibold px-6 py-3 rounded-full transition">Stay</button>
          <button id="leaveConfirmBtn" class="flex-1 bg-softred hover:bg-softred/90 text-white font-bold px-6 py-3 rounded-full transition shadow-md">Leave</button>
        </div>
      </div>`;
    document.body.appendChild(leaveModal);
  }
  if (!document.getElementById('changeNameModal')) {
    const changeNameModal = document.createElement('div');
    changeNameModal.id = 'changeNameModal';
    changeNameModal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[60] hidden';
    changeNameModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <h2 class="text-xl font-display text-navy mb-4">Change Username</h2>
        <input type="text" id="changeNameInput" maxlength="20"
               class="w-full bg-warm/80 border-2 border-navy/10 rounded-full px-5 py-3 text-sm text-center focus:outline-none focus:border-coral/50 transition mb-4" />
        <div class="flex gap-3">
          <button id="changeCancelBtn" class="flex-1 bg-navy/10 hover:bg-navy/20 text-navy font-semibold px-6 py-3 rounded-full transition">Cancel</button>
          <button id="changeSubmitBtn" class="flex-1 bg-coral hover:bg-coral/90 text-white font-bold px-6 py-3 rounded-full transition shadow-md">Save</button>
        </div>
      </div>`;
    document.body.appendChild(changeNameModal);
  }
  if (!document.getElementById('playerMenu')) {
    const playerMenu = document.createElement('div');
    playerMenu.id = 'playerMenu';
    playerMenu.className = 'absolute bg-white rounded-2xl shadow-xl border border-navy/5 py-2 z-[70] hidden min-w-[140px]';
    document.body.appendChild(playerMenu);
  }
  if (!document.getElementById('kickReasonModal')) {
    const kickReasonModal = document.createElement('div');
    kickReasonModal.id = 'kickReasonModal';
    kickReasonModal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[70] hidden';
    kickReasonModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4 text-softred"><i class="fas fa-user-slash"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">Kick Player</h2>
        <p class="text-navy/60 text-sm mb-4">Why should <span id="kickTargetName"></span> be kicked?</p>
        <input type="text" id="kickReasonInput" maxlength="100"
               class="w-full bg-warm/80 border-2 border-navy/10 rounded-full px-5 py-3 text-sm text-center focus:outline-none focus:border-softred transition mb-4" />
        <div class="flex gap-3">
          <button id="kickReasonCancelBtn" class="flex-1 bg-navy/10 hover:bg-navy/20 text-navy font-semibold px-6 py-3 rounded-full transition">Cancel</button>
          <button id="kickReasonConfirmBtn" class="flex-1 bg-softred hover:bg-softred/90 text-white font-bold px-6 py-3 rounded-full transition shadow-md">Kick</button>
        </div>
      </div>`;
    document.body.appendChild(kickReasonModal);
  }
  if (!document.getElementById('warnModal')) {
    const warnModal = document.createElement('div');
    warnModal.id = 'warnModal';
    warnModal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[70] hidden';
    warnModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4 text-warn"><i class="fas fa-exclamation-triangle"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">Warn Player</h2>
        <p class="text-navy/60 text-sm mb-4">What's the reason <span id="warnTargetName"></span> should be warned?</p>
        <input type="text" id="warnReasonInput" maxlength="100"
               class="w-full bg-warm/80 border-2 border-navy/10 rounded-full px-5 py-3 text-sm text-center focus:outline-none focus:border-warn transition mb-4" />
        <div class="flex gap-3">
          <button id="warnCancelBtn" class="flex-1 bg-navy/10 hover:bg-navy/20 text-navy font-semibold px-6 py-3 rounded-full transition">Cancel</button>
          <button id="warnConfirmBtn" class="flex-1 bg-warn hover:bg-[#e8924e] text-white font-bold px-6 py-3 rounded-full transition shadow-md">Warn</button>
        </div>
      </div>`;
    document.body.appendChild(warnModal);
  }
  if (!document.getElementById('warnedModal')) {
    const warnedModal = document.createElement('div');
    warnedModal.id = 'warnedModal';
    warnedModal.className = 'fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-[80] hidden';
    warnedModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4" style="color: #ffa364;"><i class="fas fa-exclamation-triangle"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">You've been warned</h2>
        <div class="bg-warm/80 rounded-2xl p-4 mb-6 text-sm text-navy/70 italic">
          "<span id="warnedReason"></span>"
        </div>
        <button id="warnedDismissBtn" class="text-white font-semibold px-8 py-3 rounded-full transition w-full shadow-md" style="background-color: #ffa364;">
          I understand
        </button>
      </div>`;
    document.body.appendChild(warnedModal);
  }
  if (!document.getElementById('kickedModal')) {
    const kickedModal = document.createElement('div');
    kickedModal.id = 'kickedModal';
    kickedModal.className = 'fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-[80] hidden';
    kickedModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4 text-softred"><i class="fas fa-door-closed"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">You've been kicked out</h2>
        <p class="text-navy/60 text-sm mb-6" id="kickedReason"></p>
        <button id="kickedDismissBtn" class="bg-softred hover:bg-softred/90 text-white font-bold px-8 py-3 rounded-full transition w-full shadow-md">
          Back to home
        </button>
      </div>`;
    document.body.appendChild(kickedModal);
  }
  if (!document.getElementById('endGameModal')) {
    const endGameModal = document.createElement('div');
    endGameModal.id = 'endGameModal';
    endGameModal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[70] hidden';
    endGameModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4 text-softred"><i class="fas fa-stop-circle"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">End Game?</h2>
        <p class="text-navy/60 text-sm mb-6">Everyone will return to the lobby.</p>
        <div class="flex gap-3">
          <button id="endGameCancelBtn" class="flex-1 bg-navy/10 hover:bg-navy/20 text-navy font-semibold px-6 py-3 rounded-full transition">Cancel</button>
          <button id="endGameConfirmBtn" class="flex-1 bg-softred hover:bg-softred/90 text-white font-bold px-6 py-3 rounded-full transition shadow-md">End Game</button>
        </div>
      </div>`;
    document.body.appendChild(endGameModal);
  }
  if (!document.getElementById('gameEndedModal')) {
    const gameEndedModal = document.createElement('div');
    gameEndedModal.id = 'gameEndedModal';
    gameEndedModal.className = 'fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-[80] hidden';
    gameEndedModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4 text-coral"><i class="fas fa-flag-checkered"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">Game Ended</h2>
        <p class="text-navy/60 text-sm mb-6" id="gameEndedMessage"></p>
        <button id="gameEndedDismissBtn" class="bg-coral hover:bg-coral/90 text-white font-bold px-8 py-3 rounded-full transition w-full shadow-md">OK</button>
      </div>`;
    document.body.appendChild(gameEndedModal);
  }
  if (!document.getElementById('voteModal')) {
    const voteModal = document.createElement('div');
    voteModal.id = 'voteModal';
    voteModal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[70] hidden';
    voteModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4 text-coral"><i class="fas fa-poll"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">Vote for a Game</h2>
        <p class="text-navy/60 text-sm mb-4">Choose the next game to play.</p>
        <div id="voteOptions" class="space-y-2 mb-4"></div>
        <button id="voteCancelBtn" class="bg-navy/10 hover:bg-navy/20 text-navy font-semibold px-6 py-3 rounded-full transition w-full">Cancel</button>
      </div>`;
    document.body.appendChild(voteModal);
  }
  if (!document.getElementById('gameInProgressModal')) {
    const gameInProgressModal = document.createElement('div');
    gameInProgressModal.id = 'gameInProgressModal';
    gameInProgressModal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[60] hidden';
    gameInProgressModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4 text-softred"><i class="fas fa-gamepad"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">Game in Progress</h2>
        <p class="text-navy/60 text-sm mb-6">This room is currently playing a game. Wait for it to finish, or ask the host for an invite when it's over.</p>
        <button id="gameInProgressCloseBtn" class="bg-coral hover:bg-coral/90 text-white font-bold px-8 py-3 rounded-full transition w-full shadow-md">Go Back</button>
      </div>`;
    document.body.appendChild(gameInProgressModal);
  }
  if (!document.getElementById('roomNotFoundModal')) {
    const roomNotFoundModal = document.createElement('div');
    roomNotFoundModal.id = 'roomNotFoundModal';
    roomNotFoundModal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[60] hidden';
    roomNotFoundModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop">
        <div class="text-5xl mb-4 text-softred"><i class="fas fa-search"></i></div>
        <h2 class="text-xl font-display text-navy mb-2">Room Not Found</h2>
        <p class="text-navy/60 text-sm mb-6">That room doesn't exist. Check the code and try again.</p>
        <button id="roomNotFoundCloseBtn" class="bg-coral hover:bg-coral/90 text-white font-bold px-8 py-3 rounded-full transition w-full shadow-md">Go Back</button>
      </div>`;
    document.body.appendChild(roomNotFoundModal);
  }
  if (!document.getElementById('bannedModal')) {
    const bannedModal = document.createElement('div');
    bannedModal.id = 'bannedModal';
    bannedModal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[70] hidden';
    bannedModal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop max-h-[80vh] flex flex-col">
        <div class="text-4xl mb-4 text-softred"><i class="fas fa-ban"></i></div>
        <h2 class="text-xl font-display text-navy mb-4">Banned Players</h2>
        <div id="bannedListContent" class="flex-1 overflow-y-auto mb-4 text-sm text-navy/70 space-y-2">
          <p class="text-navy/40">No banned players.</p>
        </div>
        <button id="bannedCloseBtn" class="bg-navy/10 hover:bg-navy/20 text-navy font-semibold px-6 py-3 rounded-full transition w-full">Close</button>
      </div>`;
    document.body.appendChild(bannedModal);
  }
}
function bindModalEvents(socket) {
  document.getElementById('leaveRoomBtn').addEventListener('click', () => {
    document.getElementById('leaveModal').classList.remove('hidden');
  });
  document.getElementById('leaveCancelBtn').addEventListener('click', () => {
    document.getElementById('leaveModal').classList.add('hidden');
  });
  document.getElementById('leaveConfirmBtn').addEventListener('click', () => {
  document.getElementById('leaveModal').classList.add('hidden');
  localStorage.removeItem('kifuga_host_token');
  localStorage.removeItem('kifuga_host_room');
  navigateTo('/');
});
  document.getElementById('copyCodeBtn').addEventListener('click', async () => {
    const code = document.getElementById('roomCode').textContent;
    await navigator.clipboard.writeText(code);
    const btn = document.getElementById('copyCodeBtn');
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 1500);
  });
  document.addEventListener('openChangeNameModal', () => {
    const storedName = localStorage.getItem('kifuga_name') || '';
    document.getElementById('changeNameInput').value = storedName;
    document.getElementById('changeNameModal').classList.remove('hidden');
    document.getElementById('changeNameInput').focus();
  });
  document.getElementById('changeCancelBtn').addEventListener('click', () => {
    document.getElementById('changeNameModal').classList.add('hidden');
  });
  document.getElementById('changeSubmitBtn').addEventListener('click', () => {
    const newName = document.getElementById('changeNameInput').value.trim();
    if (newName) {
      socket.emit('changeName', newName);
      localStorage.setItem('kifuga_name', newName);
    }
    document.getElementById('changeNameModal').classList.add('hidden');
  });
  let currentMenuPlayerId = null;
  document.addEventListener('openPlayerMenu', (e) => {
    const { playerId, x, y } = e.detail;
    currentMenuPlayerId = playerId;
    const menu = document.getElementById('playerMenu');
    menu.innerHTML = '';
    const addItem = (label, icon, colorClass, onClick) => {
      const item = document.createElement('button');
      item.className = `w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition ${colorClass}`;
      item.innerHTML = `<i class="${icon} w-4 text-center"></i> ${label}`;
      item.addEventListener('click', onClick);
      menu.appendChild(item);
    };
    addItem('Make Host', 'fas fa-crown', 'text-softyellow', () => {
      socket.emit('makeHost', playerId);
    });
    addItem('Warn', 'fas fa-exclamation-triangle', 'text-warn', () => {
      showWarnModal(playerId, socket);
    });
    addItem('Mute/Unmute', 'fas fa-microphone-slash', 'text-navy/60', () => {
      socket.emit('toggleMute', playerId);
    });
    addItem('Clear Messages', 'fas fa-eraser', 'text-navy/60', () => {
      socket.emit('clearMessages', playerId);
    });
    addItem('Kick', 'fas fa-sign-out-alt', 'text-softred', () => {
      showKickModal(playerId, socket);
    });
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('hidden');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('playerMenu');
    if (menu && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
  document.getElementById('kickReasonCancelBtn').addEventListener('click', () => {
    document.getElementById('kickReasonModal').classList.add('hidden');
  });
  document.getElementById('kickReasonConfirmBtn').addEventListener('click', () => {
    const reason = document.getElementById('kickReasonInput').value.trim() || 'No reason given';
    const playerId = document.getElementById('kickReasonModal').dataset.playerId;
    if (playerId) socket.emit('kickPlayer', { targetId: playerId, reason });
    document.getElementById('kickReasonModal').classList.add('hidden');
  });
  document.getElementById('warnCancelBtn').addEventListener('click', () => {
    document.getElementById('warnModal').classList.add('hidden');
  });
  document.getElementById('warnConfirmBtn').addEventListener('click', () => {
    const reason = document.getElementById('warnReasonInput').value.trim() || 'No reason given';
    const playerId = document.getElementById('warnModal').dataset.playerId;
    if (playerId) socket.emit('warnPlayer', { targetId: playerId, reason });
    document.getElementById('warnModal').classList.add('hidden');
  });
  document.getElementById('warnedDismissBtn').addEventListener('click', () => {
    document.getElementById('warnedModal').classList.add('hidden');
  });
  document.getElementById('kickedDismissBtn').addEventListener('click', () => {
    navigateTo('/');
  });
  document.getElementById('endGameCancelBtn').addEventListener('click', () => {
    document.getElementById('endGameModal').classList.add('hidden');
  });
  document.getElementById('endGameConfirmBtn').addEventListener('click', () => {
    socket.emit('backToLobby');
    document.getElementById('endGameModal').classList.add('hidden');
  });
  document.getElementById('gameEndedDismissBtn').addEventListener('click', () => {
    document.getElementById('gameEndedModal').classList.add('hidden');
  });
  document.getElementById('gameInProgressCloseBtn').addEventListener('click', () => {
    navigateTo('/');
  });
  document.getElementById('roomNotFoundCloseBtn').addEventListener('click', () => {
    navigateTo('/');
  });
  document.getElementById('bannedCloseBtn').addEventListener('click', () => {
    document.getElementById('bannedModal').classList.add('hidden');
  });
  document.getElementById('mobilePlayersBtn').addEventListener('click', () => {
    const list = document.getElementById('playerList');
    showToast('Players listed in sidebar');
  });
}
function bindGlobalModalListeners(socket) {
  document.querySelectorAll('.fixed.inset-0.bg-navy\\/30, .fixed.inset-0.bg-navy\\/40').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
  socket.on('kicked', ({ reason }) => {
    localStorage.removeItem('kifuga_host_token');
    localStorage.removeItem('kifuga_host_room');
    document.getElementById('kickedReason').textContent = 'Reason: ' + reason;
    document.getElementById('kickedModal').classList.remove('hidden');
  });
  socket.on('warned', ({ reason }) => {
    document.getElementById('warnedReason').textContent = reason;
    document.getElementById('warnedModal').classList.remove('hidden');
  });
  socket.on('gameEnded', ({ name }) => {
    document.getElementById('gameEndedMessage').textContent = `${name} ended the game session.`;
    document.getElementById('gameEndedModal').classList.remove('hidden');
  });
  socket.on('bannedList', (list) => {
    const content = document.getElementById('bannedListContent');
    if (list.length === 0) {
      content.innerHTML = '<p class="text-navy/40">No banned players.</p>';
    } else {
      content.innerHTML = list.map(item => `
        <div class="flex items-center justify-between bg-warm/80 rounded-xl p-3">
          <div class="text-left">
            <span class="font-semibold">${item.name}</span>
            <p class="text-xs text-navy/50">${item.reason}</p>
          </div>
          <button class="unban-btn text-softred hover:text-red-700 transition text-xs font-semibold" data-name="${item.name}">
            <i class="fas fa-undo"></i> Unban
          </button>
        </div>
      `).join('');
      content.querySelectorAll('.unban-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          socket.emit('unbanPlayer', btn.dataset.name);
        });
      });
    }
    document.getElementById('bannedModal').classList.remove('hidden');
  });
}
function showKickModal(playerId, socket) {
  document.getElementById('kickReasonModal').dataset.playerId = playerId;
  document.getElementById('kickReasonInput').value = '';
  document.getElementById('kickReasonModal').classList.remove('hidden');
  document.getElementById('kickReasonInput').focus();
}
function showWarnModal(playerId, socket) {
  document.getElementById('warnModal').dataset.playerId = playerId;
  document.getElementById('warnReasonInput').value = '';
  document.getElementById('warnModal').classList.remove('hidden');
  document.getElementById('warnReasonInput').focus();
}
export { setupModals, showKickModal, showWarnModal };
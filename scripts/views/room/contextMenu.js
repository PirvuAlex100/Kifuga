let menuVisible = false;
let subMenuVisible = null;
let isHost = false;
let isListed = true;
let isMusicMuted = false;
let currentMaxPlayers = 5;
let cursorMode = localStorage.getItem('kifuga_cursor') || 'kifuga';
function createMenuDOM() {
  if (document.getElementById('settingsContextMenu')) return;
  const menu = document.createElement('div');
  menu.id = 'settingsContextMenu';
  menu.className = 'bg-white rounded-2xl shadow-xl border border-navy/5 py-2 z-[100] hidden';
  menu.style.minWidth = '200px';
  menu.innerHTML = `
    <button id="ctxChangeName" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition text-navy">
      <i class="fas fa-user-edit w-4 text-center"></i> Change Username
    </button>
    <div id="ctxVisibilityWrapper" class="relative">
      <button id="ctxVisibilityBtn" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition text-navy">
        <i class="fas fa-eye w-4 text-center"></i> Visibility
        <i class="fas fa-chevron-right ml-auto text-xs text-navy/40"></i>
      </button>
      <div id="ctxVisibilitySub" class="absolute left-full top-0 bg-white rounded-2xl shadow-xl border border-navy/5 py-2 min-w-[160px] hidden" style="margin-left: -4px;">
        <button id="ctxListed" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition">
          <i class="fas fa-globe w-4 text-center text-softgreen"></i> Listed
          <i class="fas fa-check ml-auto text-softgreen text-xs hidden"></i>
        </button>
        <button id="ctxUnlisted" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition">
          <i class="fas fa-link w-4 text-center text-softred"></i> Unlisted
          <i class="fas fa-check ml-auto text-softred text-xs hidden"></i>
        </button>
      </div>
    </div>
        <div id="ctxMaxPlayersWrapper" class="relative">
      <button id="ctxMaxPlayersBtn" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition text-navy">
        <i class="fas fa-users w-4 text-center"></i> Max Players
        <i class="fas fa-chevron-right ml-auto text-xs text-navy/40"></i>
      </button>
      <div id="ctxMaxPlayersSub" class="absolute left-full top-0 bg-white rounded-2xl shadow-xl border border-navy/5 py-2 min-w-[120px] hidden" style="margin-left: -4px;">
        ${[2,3,4,5].map(n => `
          <button id="ctxMaxPlayers${n}" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition">
            <span class="w-4 text-center font-semibold">${n}</span>
            <i class="fas fa-check ml-auto text-softgreen text-xs hidden"></i>
          </button>
        `).join('')}
      </div>
    </div>
    <div id="ctxMusicWrapper" class="relative">
      <button id="ctxMusicBtn" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition text-navy">
        <i class="fas fa-music w-4 text-center"></i> Music
        <i class="fas fa-chevron-right ml-auto text-xs text-navy/40"></i>
      </button>
      <div id="ctxMusicSub" class="absolute left-full top-0 bg-white rounded-2xl shadow-xl border border-navy/5 py-2 min-w-[160px] hidden" style="margin-left: -4px;">
        <button id="ctxMusicMute" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition">
          <i class="fas fa-volume-mute w-4 text-center text-softred"></i> Mute
          <i class="fas fa-check ml-auto text-softred text-xs hidden"></i>
        </button>
        <button id="ctxMusicUnmute" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition">
          <i class="fas fa-volume-up w-4 text-center text-softgreen"></i> Unmute
          <i class="fas fa-check ml-auto text-softgreen text-xs hidden"></i>
        </button>
      </div>
    </div>
        <div id="ctxCursorWrapper" class="relative">
      <button id="ctxCursorBtn" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition text-navy">
        <i class="fas fa-mouse-pointer w-4 text-center"></i> Cursor
        <i class="fas fa-chevron-right ml-auto text-xs text-navy/40"></i>
      </button>
      <div id="ctxCursorSub" class="absolute left-full top-0 bg-white rounded-2xl shadow-xl border border-navy/5 py-2 min-w-[160px] hidden" style="margin-left: -4px;">
  <button id="ctxCursorWindows" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition">
    <i class="fab fa-windows w-4 text-center" style="color: #0078D6;"></i> Windows
    <i class="fas fa-check ml-auto text-navy text-xs hidden"></i>
  </button>
  <button id="ctxCursorDefault" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition">
    <i class="fas fa-mouse-pointer w-4 text-center text-coral"></i> Default
    <i class="fas fa-check ml-auto text-navy text-xs hidden"></i>
  </button>
  <button id="ctxCursorRainbow" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition">
    <i class="fas fa-palette w-4 text-center" style="color: #FF6B5E;"></i> Colorful
    <i class="fas fa-check ml-auto text-softgreen text-xs hidden"></i>
  </button>
</div>
    </div>
    <hr class="my-1 border-navy/5" />
    <button id="ctxLeave" class="w-full text-left px-4 py-2.5 text-sm hover:bg-warm/80 flex items-center gap-3 transition text-softred">
      <i class="fas fa-sign-out-alt w-4 text-center"></i> Leave Room
    </button>
  `;
  document.body.appendChild(menu);
}
function updateMenuState() {
  const visWrapper = document.getElementById('ctxVisibilityWrapper');
  if (visWrapper) visWrapper.classList.toggle('hidden', !isHost);
  const listedCheck = document.querySelector('#ctxListed .fa-check');
  const unlistedCheck = document.querySelector('#ctxUnlisted .fa-check');
  if (listedCheck) listedCheck.classList.toggle('hidden', !isListed);
  if (unlistedCheck) unlistedCheck.classList.toggle('hidden', isListed);
  const muteCheck = document.querySelector('#ctxMusicMute .fa-check');
  const unmuteCheck = document.querySelector('#ctxMusicUnmute .fa-check');
  if (muteCheck) muteCheck.classList.toggle('hidden', !isMusicMuted);
  if (unmuteCheck) unmuteCheck.classList.toggle('hidden', isMusicMuted);
      const rainbowCheck = document.querySelector('#ctxCursorRainbow .fa-check');
  const defaultCheck = document.querySelector('#ctxCursorDefault .fa-check');
  const windowsCheck = document.querySelector('#ctxCursorWindows .fa-check');
  if (rainbowCheck) rainbowCheck.classList.toggle('hidden', cursorMode !== 'rainbow');
  if (defaultCheck) defaultCheck.classList.toggle('hidden', cursorMode !== 'kifuga');
  if (windowsCheck) windowsCheck.classList.toggle('hidden', cursorMode !== 'windows');
    const maxWrapper = document.getElementById('ctxMaxPlayersWrapper');
  if (maxWrapper) maxWrapper.classList.toggle('hidden', !isHost);
  for (let n = 2; n <= 5; n++) {
    const check = document.querySelector(`#ctxMaxPlayers${n} .fa-check`);
    if (check) check.classList.toggle('hidden', currentMaxPlayers !== n);
  }
}
function hideAllSubMenus() {
    document.querySelectorAll('#ctxVisibilitySub, #ctxMusicSub, #ctxCursorSub, #ctxMaxPlayersSub').forEach(el => el.classList.add('hidden'));
  subMenuVisible = null;
}
function flipSubmenus(menu) {
  const menuRect = menu.getBoundingClientRect();
    const subMenus = document.querySelectorAll('#ctxVisibilitySub, #ctxMusicSub, #ctxCursorSub, #ctxMaxPlayersSub');
  if (menuRect.right + 170 > window.innerWidth) {
    subMenus.forEach(sub => {
      sub.classList.remove('left-full');
      sub.classList.add('right-full');
      sub.style.marginLeft = '';
      sub.style.marginRight = '-4px';
    });
  } else {
    subMenus.forEach(sub => {
      sub.classList.remove('right-full');
      sub.classList.add('left-full');
      sub.style.marginRight = '';
      sub.style.marginLeft = '-4px';
    });
  }
}
export function setupContextMenu(socket, getIsHost) {
  createMenuDOM();
  const menu = document.getElementById('settingsContextMenu');
  const gearBtn = document.getElementById('settingsGearBtn');
  document.getElementById('ctxMaxPlayersBtn').addEventListener('mouseenter', () => {
    hideAllSubMenus();
    document.getElementById('ctxMaxPlayersSub').classList.remove('hidden');
    subMenuVisible = 'maxplayers';
  });
  document.getElementById('ctxMaxPlayersWrapper').addEventListener('mouseleave', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest('#ctxMaxPlayersWrapper')) {
      document.getElementById('ctxMaxPlayersSub').classList.add('hidden');
      if (subMenuVisible === 'maxplayers') subMenuVisible = null;
    }
  });
  document.getElementById('ctxMaxPlayersBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const sub = document.getElementById('ctxMaxPlayersSub');
    const isOpen = !sub.classList.contains('hidden');
    hideAllSubMenus();
    if (!isOpen) {
      sub.classList.remove('hidden');
      subMenuVisible = 'maxplayers';
    }
  });
  for (let n = 2; n <= 5; n++) {
    document.getElementById(`ctxMaxPlayers${n}`).addEventListener('click', () => {
      currentMaxPlayers = n;
      socket.emit('setMaxPlayers', n);
      updateMenuState();
      hideMenu();
    });
  }
  function showMenu(x, y) {
    menu.style.position = 'fixed';
    menu.style.right = 'auto';
    menu.style.top = y + 'px';
    menu.style.left = x + 'px';
    menu.classList.remove('hidden');
    menuVisible = true;
    hideAllSubMenus();
    updateMenuState();
    flipSubmenus(menu);
  }
  function hideMenu() {
    menu.classList.add('hidden');
    menuVisible = false;
    hideAllSubMenus();
  }
  if (gearBtn) {
    gearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = gearBtn.getBoundingClientRect();
      showMenu(rect.right - 200, rect.bottom + 8);
    });
  }
  document.addEventListener('contextmenu', (e) => {
    if (document.getElementById('app')?.classList.contains('h-screen')) {
      e.preventDefault();
      const x = Math.min(e.clientX, window.innerWidth - 210);
      const y = Math.min(e.clientY, window.innerHeight - 200);
      showMenu(x, y);
    }
  });
  document.addEventListener('click', (e) => {
    if (menuVisible && !menu.contains(e.target)) {
      hideMenu();
    }
  });
  menu.addEventListener('click', (e) => e.stopPropagation());
  document.getElementById('ctxVisibilityBtn').addEventListener('mouseenter', () => {
    hideAllSubMenus();
    document.getElementById('ctxVisibilitySub').classList.remove('hidden');
    subMenuVisible = 'visibility';
  });
  document.getElementById('ctxVisibilityWrapper').addEventListener('mouseleave', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest('#ctxVisibilityWrapper')) {
      document.getElementById('ctxVisibilitySub').classList.add('hidden');
      if (subMenuVisible === 'visibility') subMenuVisible = null;
    }
  });
  document.getElementById('ctxMusicBtn').addEventListener('mouseenter', () => {
    hideAllSubMenus();
    document.getElementById('ctxMusicSub').classList.remove('hidden');
    subMenuVisible = 'music';
  });
  document.getElementById('ctxMusicWrapper').addEventListener('mouseleave', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest('#ctxMusicWrapper')) {
      document.getElementById('ctxMusicSub').classList.add('hidden');
      if (subMenuVisible === 'music') subMenuVisible = null;
    }
  });
  document.getElementById('ctxChangeName').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('openChangeNameModal'));
    hideMenu();
  });
  document.getElementById('ctxVisibilityBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const sub = document.getElementById('ctxVisibilitySub');
    const isOpen = !sub.classList.contains('hidden');
    hideAllSubMenus();
    if (!isOpen) {
      sub.classList.remove('hidden');
      subMenuVisible = 'visibility';
    }
  });
  document.getElementById('ctxMusicBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const sub = document.getElementById('ctxMusicSub');
    const isOpen = !sub.classList.contains('hidden');
    hideAllSubMenus();
    if (!isOpen) {
      sub.classList.remove('hidden');
      subMenuVisible = 'music';
    }
  });
  document.getElementById('ctxListed').addEventListener('click', () => {
    if (!isListed) socket.emit('togglePrivacy');
    hideMenu();
  });
  document.getElementById('ctxUnlisted').addEventListener('click', () => {
    if (isListed) socket.emit('togglePrivacy');
    hideMenu();
  });
  document.getElementById('ctxMusicMute').addEventListener('click', () => {
  isMusicMuted = true;
  updateMenuState();
  if (window.bgMusic) {
    window.bgMusic.pause();
  }
  hideMenu();
});
document.getElementById('ctxMusicUnmute').addEventListener('click', () => {
  isMusicMuted = false;
  updateMenuState();
  if (window.bgMusic) {
    window.bgMusic.play().catch(() => {});
  }
  hideMenu();
});
  document.getElementById('ctxCursorBtn').addEventListener('mouseenter', () => {
    hideAllSubMenus();
    document.getElementById('ctxCursorSub').classList.remove('hidden');
    subMenuVisible = 'cursor';
  });
  document.getElementById('ctxCursorWrapper').addEventListener('mouseleave', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest('#ctxCursorWrapper')) {
      document.getElementById('ctxCursorSub').classList.add('hidden');
      if (subMenuVisible === 'cursor') subMenuVisible = null;
    }
  });
  document.getElementById('ctxCursorBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const sub = document.getElementById('ctxCursorSub');
    const isOpen = !sub.classList.contains('hidden');
    hideAllSubMenus();
    if (!isOpen) {
      sub.classList.remove('hidden');
      subMenuVisible = 'cursor';
    }
  });
  document.getElementById('ctxCursorWindows').addEventListener('click', () => {
    cursorMode = 'windows';
    if (window.setCustomCursor) window.setCustomCursor('windows');
    updateMenuState();
    hideMenu();
  });
  document.getElementById('ctxCursorDefault').addEventListener('click', () => {
    cursorMode = 'kifuga';
    if (window.setCustomCursor) window.setCustomCursor('kifuga');
    updateMenuState();
    hideMenu();
  });
  document.getElementById('ctxCursorRainbow').addEventListener('click', () => {
    cursorMode = 'rainbow';
    if (window.setCustomCursor) window.setCustomCursor('rainbow');
    updateMenuState();
    hideMenu();
  });
  document.getElementById('ctxLeave').addEventListener('click', () => {
    document.getElementById('leaveModal').classList.remove('hidden');
    hideMenu();
  });
    window.updateContextMenuMaxPlayers = (max) => {
    currentMaxPlayers = max;
    updateMenuState();
  };
  window.updateContextMenuHost = (hostStatus) => {
    isHost = hostStatus;
    updateMenuState();
  };
  window.updateContextMenuPrivacy = (listed) => {
    isListed = listed;
    updateMenuState();
  };
}
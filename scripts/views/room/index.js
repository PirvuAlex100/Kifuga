import { renderRoomHTML, updatePlayerList, showToast } from './ui.js';
import { setupChat } from './chat.js';
import { setupVoice, cleanupVoice } from './voice.js';
import { setupLobby, updateGameCards } from './lobby.js';
import { setupModals } from './modals.js';
import { setupContextMenu } from './contextMenu.js';
import { renderBuzzBattleUI, cleanupBuzzBattle } from './games/buzzBattle.js';
import { renderSearchEngine, cleanupSearchEngine } from './games/searchEngine.js';
import { renderStoryChain, cleanupStoryChain } from './games/storyChain.js';
import { renderScribbleUI, cleanupScribble } from './games/scribble.js';
let currentGameCleanup = null;
function setupMaxPlayers(socket) {
  const select = document.getElementById('maxPlayersSelect');
  if (select) {
    select.addEventListener('change', () => {
      const newMax = parseInt(select.value);
      socket.emit('setMaxPlayers', newMax);
    });
  }
}
function renderRoomView(searchString) {
  document.body.classList.add('h-screen', 'overflow-hidden');
  document.body.classList.remove('overflow-x-hidden');
  const app = document.getElementById('app');
  app.className = 'h-screen flex flex-col';
  app.innerHTML = renderRoomHTML();
  const logoLink = document.querySelector('a.font-display');
  if (logoLink) {
    logoLink.addEventListener('mouseenter', () => {
      const letters = document.querySelectorAll('.logo-letter');
      letters.forEach((letter, i) => {
        setTimeout(() => {
          letter.classList.add('logo-bounce');
          setTimeout(() => letter.classList.remove('logo-bounce'), 400);
        }, i * 80);
      });
    });
  }
  const socket = window.socket;
  let roomCode = '';
  let playerName = '';
  let isHost = false;
  let currentPlayers = [];
  setupChat(socket);
  setupVoice(socket);
  setupModals(socket);
  setupNameModal(socket);
  setupRoomHeader(socket);
  setupMobilePlayers();
  setupPrivacyToggle(socket);
  setupMaxPlayers(socket);
  setupLobby(socket, () => isHost);
  setupContextMenu(socket, () => isHost);
  function cleanupGame() {
  if (currentGameCleanup) {
    currentGameCleanup();
    currentGameCleanup = null;
  }
}
  socket.on('gameStart', ({ gameId }) => {
    document.getElementById('lobbyState').classList.add('hidden');
    const gameState = document.getElementById('gameState');
    gameState.classList.remove('hidden');
    cleanupGame();
    switch (gameId) {
      case 'search-engine':
        currentGameCleanup = cleanupSearchEngine;
        renderSearchEngine(socket, gameState);
        break;
      case 'buzz-battle':
        currentGameCleanup = cleanupBuzzBattle;
        renderBuzzBattleUI(socket, gameState, isHost, currentPlayers);
        break;
      case 'story-chain':
        currentGameCleanup = cleanupStoryChain;
        renderStoryChain(socket, gameState, currentPlayers);
        break;
      case 'scribble':
  currentGameCleanup = () => cleanupScribble(socket);
  renderScribbleUI(socket, gameState);
  break;
      default:
        gameState.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-center">
            <i class="fas fa-gamepad text-6xl text-coral mb-4"></i>
            <h2 class="text-2xl font-display">${getGameName(gameId)}</h2>
            <p class="text-navy/60 mt-2">Game is starting...</p>
            ${isHost ? '<button id="backToLobbyBtn" class="mt-6 bg-navy/10 hover:bg-navy/20 text-navy font-semibold px-6 py-2 rounded-full transition"><i class="fas fa-arrow-left mr-2"></i>Back to Lobby</button>' : ''}
          </div>`;
        const btn = document.getElementById('backToLobbyBtn');
        if (btn) btn.addEventListener('click', () => socket.emit('backToLobby'));
    }
  });
  socket.on('backToLobby', () => {
    cleanupGame();
    document.getElementById('lobbyState').classList.remove('hidden');
    const gameState = document.getElementById('gameState');
    gameState.classList.add('hidden');
    gameState.classList.add('items-center', 'justify-center');
    gameState.style.overflow = '';
    gameState.style.background = '';
    gameState.style.fontFamily = '';
  });
  socket.on('roomUpdate', (state) => {
    if (!state) return;
    isHost = state.hostId === socket.id;
    if (window.updateContextMenuHost) window.updateContextMenuHost(isHost);
    if (state.isListed !== undefined && window.updateContextMenuPrivacy) window.updateContextMenuPrivacy(state.isListed);
    if (window.updateContextMenuMaxPlayers) window.updateContextMenuMaxPlayers(state.maxPlayers);
    currentPlayers = state.players;
    document.getElementById('playerCount').textContent = state.players.length;
    const maxDisplay = document.getElementById('maxPlayersDisplay');
    const maxSelect = document.getElementById('maxPlayersSelect');
    if (state.maxPlayers !== undefined) {
      maxDisplay.textContent = state.maxPlayers;
      maxSelect.value = state.maxPlayers;
    }
    if (isHost) {
      maxDisplay.classList.add('hidden');
      maxSelect.classList.remove('hidden');
    } else {
      maxDisplay.classList.remove('hidden');
      maxSelect.classList.add('hidden');
    }
    updatePlayerList(state.players, socket, isHost);
    updateGameCards(state.players.length);
    handleMuteState(state.players, socket);
    const privacyToggle = document.getElementById('privacyToggle');
    if (privacyToggle) {
      privacyToggle.classList.toggle('hidden', !isHost);
    }
  });
  socket.on('privacyUpdated', ({ isListed }) => {
    const icon = document.getElementById('privacyIcon');
    const label = document.getElementById('privacyLabel');
    if (window.updateContextMenuPrivacy) window.updateContextMenuPrivacy(isListed);
    if (icon && label) {
      if (isListed) {
        icon.className = 'fas fa-globe text-xs text-softgreen';
        label.textContent = 'Listed';
      } else {
        icon.className = 'fas fa-link text-xs text-softred';
        label.textContent = 'Unlisted';
      }
    }
  });
  function setupNameModal(socket) {
    const nameModal = document.getElementById('nameModal');
    const nameInput = document.getElementById('nameInput');
    const nameSubmitBtn = document.getElementById('nameSubmitBtn');
    const roomNameField = document.getElementById('roomNameField');
    const roomNameInput = document.getElementById('roomNameInput');
    const storedName = localStorage.getItem('kifuga_name');
    const storedHostToken = localStorage.getItem('kifuga_host_token');
    const storedHostRoom = localStorage.getItem('kifuga_host_room');
    const urlParams = new URLSearchParams(searchString);
    const joinCode = urlParams.get('code');
        function updateButtonState() {
  const nameOk = nameInput.value.trim().length > 0;
  const roomOk = joinCode || roomNameInput.value.trim().length > 0;
  nameSubmitBtn.disabled = !(nameOk && roomOk);
}
nameInput.addEventListener('input', updateButtonState);
roomNameInput.addEventListener('input', updateButtonState);
nameSubmitBtn.disabled = true;
    if (joinCode) {
      roomNameField.classList.add('hidden');
      nameSubmitBtn.innerHTML = 'Join Room <i class="fas fa-arrow-right ml-2"></i>';
    } else {
      roomNameField.classList.remove('hidden');
      nameSubmitBtn.innerHTML = 'Create Room <i class="fas fa-plus-circle ml-2"></i>';
    }
    function enterRoom() {
  playerName = nameInput.value.trim();
  if (!playerName) {
    nameInput.style.borderColor = '#E53935';
    nameInput.placeholder = 'Please enter a name!';
    nameInput.focus();
    return;
  }
  nameInput.style.borderColor = '';
  localStorage.setItem('kifuga_name', playerName);
  nameModal.style.display = 'none';
      if (joinCode) {
        if (storedHostToken && storedHostRoom === joinCode.toUpperCase()) {
          socket.emit('rejoinHost', joinCode, storedHostToken, playerName, (response) => {
            if (!response.success) {
              socket.emit('joinRoom', joinCode, playerName, (res) => {
                if (!res.success) { handleJoinError(res); return; }
                roomCode = res.code;
                document.getElementById('roomCode').textContent = roomCode;
                history.replaceState(null, '', `/room?code=${roomCode}`);
              });
              return;
            }
            roomCode = response.code;
            isHost = true;
            document.getElementById('roomCode').textContent = roomCode;
            history.replaceState(null, '', `/room?code=${roomCode}`);
          });
        } else {
          socket.emit('joinRoom', joinCode, playerName, (response) => {
            if (!response.success) { handleJoinError(response); return; }
            roomCode = response.code;
            document.getElementById('roomCode').textContent = roomCode;
            history.replaceState(null, '', `/room?code=${roomCode}`);
          });
        }
      } else {
        const roomName = roomNameInput.value.trim();
if (!roomName) {
  roomNameInput.style.borderColor = '#E53935';
  roomNameInput.placeholder = 'Please enter a room name!';
  roomNameInput.focus();
  return;
}
nameSubmitBtn.disabled = true;
roomNameInput.style.borderColor = '';
        socket.emit('createRoom', { playerName, roomName }, (response) => {
          if (!response.success) { alert('Failed to create room.'); navigateTo('/'); return; }
          roomCode = response.code;
          isHost = true;
          localStorage.setItem('kifuga_host_token', response.hostToken);
          localStorage.setItem('kifuga_host_room', roomCode);
          document.getElementById('roomCode').textContent = roomCode;
          history.replaceState(null, '', `/room?code=${roomCode}`);
        });
      }
    }
    function handleJoinError(response) {
      if (response.error === 'kicked') {
        document.getElementById('kickedModal').classList.remove('hidden');
        document.getElementById('kickedReason').textContent = 'Reason: ' + (response.reason || 'No reason given');
      } else if (response.error === 'Game already in progress') {
        document.getElementById('gameInProgressModal').classList.remove('hidden');
      } else if (response.error === 'Room not found') {
        document.getElementById('roomNotFoundModal').classList.remove('hidden');
      } else {
        alert(response.error);
        navigateTo('/');
      }
    }
    nameSubmitBtn.addEventListener('click', enterRoom);
    nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') enterRoom(); });
    if (storedName && joinCode) {
      playerName = storedName;
      nameModal.style.display = 'none';
      if (storedHostToken && storedHostRoom === joinCode.toUpperCase()) {
        socket.emit('rejoinHost', joinCode, storedHostToken, playerName, (response) => {
          if (!response.success) {
            socket.emit('joinRoom', joinCode, playerName, (res) => {
              if (!res.success) { handleJoinError(res); return; }
              roomCode = res.code;
              document.getElementById('roomCode').textContent = roomCode;
              history.replaceState(null, '', `/room?code=${roomCode}`);
            });
            return;
          }
          roomCode = response.code;
          isHost = true;
          document.getElementById('roomCode').textContent = roomCode;
          history.replaceState(null, '', `/room?code=${roomCode}`);
        });
      } else {
        socket.emit('joinRoom', joinCode, playerName, (response) => {
          if (!response.success) { nameModal.style.display = 'flex'; nameInput.value = storedName; nameInput.focus(); return; }
          roomCode = response.code;
          document.getElementById('roomCode').textContent = roomCode;
          history.replaceState(null, '', `/room?code=${roomCode}`);
        });
      }
    } else {
      nameModal.style.display = 'flex';
      if (storedName) nameInput.value = storedName;
      nameInput.focus();
    }
  }
  function setupRoomHeader(socket) {
    document.getElementById('leaveRoomBtn').addEventListener('click', () => {
      document.getElementById('leaveModal').classList.remove('hidden');
    });
    document.getElementById('copyCodeBtn').addEventListener('click', async () => {
      await navigator.clipboard.writeText(roomCode);
      const btn = document.getElementById('copyCodeBtn');
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 1500);
    });
  }
  function setupPrivacyToggle(socket) {
    const toggle = document.getElementById('privacyToggle');
    if (toggle) {
      toggle.addEventListener('click', () => { socket.emit('togglePrivacy'); });
    }
  }
  function setupMobilePlayers() {
    document.getElementById('mobilePlayersBtn').addEventListener('click', () => {
      showToast('Players are listed in the sidebar');
    });
  }
  function handleMuteState(players, socket) {
    const me = players.find(p => p.id === socket.id);
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    const micBtn = document.getElementById('micToggleBtn');
    if (me && me.muted) {
      chatInput.disabled = true;
      chatInput.placeholder = 'You are muted by the host...';
      chatInput.classList.add('opacity-50', 'cursor-not-allowed');
      sendBtn.disabled = true;
      sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
      micBtn.disabled = true;
      micBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      chatInput.disabled = false;
      chatInput.placeholder = 'Type a message...';
      chatInput.classList.remove('opacity-50', 'cursor-not-allowed');
      sendBtn.disabled = false;
      sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      micBtn.disabled = false;
      micBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}
function getGameName(id) {
  const names = {
    'search-engine': 'Human Search Engine',
    'impostor': 'Impostor in the Chat',
    'best-answer': 'Best Answer Wins',
    'buzz-battle': 'Buzz Battle',
    'story-chain': 'Story Chain',
    'scribble': 'Scribble'
  };
  return names[id] || id;
}
export { renderRoomView, getGameName };
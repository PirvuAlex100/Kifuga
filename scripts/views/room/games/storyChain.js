let storyGenre = '';
let storyLines = [];
let playerColors = {};
let turnOrder = [];
let currentTurnId = null;
let myRole = null;
function renderStoryChain(socket, gameState, currentPlayers) {
  gameState.classList.remove('items-center', 'justify-center');
  gameState.innerHTML = `
    <div class="flex items-center justify-center h-full text-navy/60 text-lg">
      <i class="fas fa-hourglass-half fa-spin mr-2"></i> Waiting for genre selection...
    </div>`;
  if (!document.getElementById('genrePickModal')) {
    const modal = document.createElement('div');
    modal.id = 'genrePickModal';
    modal.className = 'fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-[70] hidden';
    modal.innerHTML = `
      <div class="rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pop"
           style="background: radial-gradient(ellipse at 50% 30%, #3b2b1a 0%, #0d1117 90%); font-family: 'Georgia', serif; border: 1px solid #5a4a2e;">
        <div class="text-5xl mb-4 text-amber-400"><i class="fas fa-book-open"></i></div>
        <h2 class="text-2xl font-bold text-amber-100 mb-2" style="text-shadow: 0 0 8px rgba(255,180,80,0.4);">Choose a Genre</h2>
        <p class="text-amber-200/60 text-sm mb-4">What kind of story will you tell?</p>
        <div id="genreOptions" class="space-y-2 mb-4">
          ${['Fantasy','Sci-Fi','Horror','Comedy','Mystery','Random'].map(g => `
            <button class="genre-option w-full bg-amber-900/30 hover:bg-amber-800/40 text-amber-100 font-semibold px-4 py-2.5 rounded-full transition text-sm border border-amber-700/40"
                    data-genre="${g}">${g}</button>
          `).join('')}
        </div>
        <button id="genrePassBtn" class="bg-amber-900/30 hover:bg-amber-800/40 text-amber-200 font-semibold px-6 py-3 rounded-full transition w-full border border-amber-700/40">
          <i class="fas fa-forward mr-1"></i> Pass to next player
        </button>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('genrePassBtn').addEventListener('click', () => {
      socket.emit('storyPassGenre');
      modal.classList.add('hidden');
    });
    modal.querySelectorAll('.genre-option').forEach(btn => {
      btn.addEventListener('click', () => {
        socket.emit('storyChooseGenre', btn.dataset.genre);
        modal.classList.add('hidden');
      });
    });
  }
  socket.on('requestGenrePick', () => {
    document.getElementById('genrePickModal').classList.remove('hidden');
  });
  socket.on('storyGenreChosen', ({ genre, timer, turnOrder: newTurnOrder, colors, role }) => {
    storyGenre = genre;
    turnOrder = newTurnOrder || [];
    playerColors = colors || {};
    myRole = role;
    storyLines = [];
    if (role === 'writer') {
      renderStoryWriterUI(socket, gameState, currentPlayers);
    } else {
      renderStoryWaitingUI(socket, gameState, currentPlayers);
    }
  });
  socket.on('storyUpdate', ({ lines, currentTurn, colors }) => {
    storyLines = lines;
    currentTurnId = currentTurn;
    if (colors) playerColors = colors;
    const storyDiv = document.getElementById('storyContent');
    if (storyDiv) {
      storyDiv.innerHTML = renderStoryLines(lines);
      storyDiv.scrollTop = storyDiv.scrollHeight;
    }
    if (currentTurn === socket.id && myRole !== 'writer') {
      myRole = 'writer';
      renderStoryWriterUI(socket, gameState, currentPlayers);
    } else if (currentTurn !== socket.id && myRole !== 'waiting') {
      myRole = 'waiting';
      renderStoryWaitingUI(socket, gameState, currentPlayers);
    }
  });
  socket.on('storyEnded', ({ lines, genre }) => {
    gameState.style.background = 'radial-gradient(ellipse at 50% 80%, #2b1e10 0%, #0d1117 70%)';
    gameState.style.fontFamily = "'Georgia', serif";
    gameState.innerHTML = `
      <div class="flex flex-col h-full p-6 items-center justify-center text-center relative z-10">
        <i class="fas fa-book-open text-6xl text-amber-400 mb-4"></i>
        <h2 class="text-3xl font-bold text-amber-100 mb-2" style="text-shadow: 0 0 10px rgba(255,180,80,0.5);">The End</h2>
        <p class="text-amber-200/70 text-sm mb-6">${genre} Story</p>
        <div class="bg-amber-50/90 backdrop-blur-sm rounded-2xl p-6 shadow-inner max-w-lg w-full max-h-60 overflow-y-auto text-sm text-left space-y-2 mb-6 border border-amber-300/60"
             style="font-family: 'Georgia', serif; color: #3b2b1a;">
          ${renderStoryLines(lines)}
        </div>
        <p class="text-amber-200/50 text-sm italic">Closing the book…</p>
      </div>`;
  });
}
function renderStoryWriterUI(socket, gameState, currentPlayers) {
  gameState.style.background = 'radial-gradient(ellipse at 50% 80%, #2b1e10 0%, #0d1117 70%)';
  gameState.style.fontFamily = "'Georgia', 'Times New Roman', serif";
  gameState.style.position = 'relative';
  gameState.style.overflow = 'hidden';
  gameState.innerHTML = `
    <div id="starsContainer" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
    <div id="firefliesContainer" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
    <div class="relative flex flex-col h-full p-4 z-10">
      <div class="text-center mb-3">
        <span class="text-xs bg-amber-900/40 text-amber-200 px-3 py-1 rounded-full font-semibold tracking-wide uppercase backdrop-blur-sm">${storyGenre}</span>
        <h2 class="text-2xl font-bold mt-1 text-amber-100" style="font-family: 'Georgia', serif; text-shadow: 0 0 10px rgba(255,180,80,0.5);">
          <i class="fas fa-feather-alt mr-2 text-amber-300"></i>Story Chain
        </h2>
      </div>
      <div class="bg-green-900/50 border border-green-600/30 text-green-200 text-sm px-4 py-2 rounded-full text-center mb-3 font-medium backdrop-blur-sm">
        <i class="fas fa-pencil-alt mr-1"></i> Your turn! Continue the story.
      </div>
      <div id="storyContent" class="flex-1 bg-amber-50/90 backdrop-blur-sm rounded-2xl p-5 shadow-inner overflow-y-auto mb-4 text-sm leading-relaxed border border-amber-300/60"
           style="font-family: 'Georgia', serif; color: #3b2b1a;">
        ${renderStoryLines(storyLines)}
      </div>
      <div class="flex gap-2">
        <input type="text" id="storyLineInput" placeholder="Write the next line..." maxlength="200"
               class="flex-1 bg-amber-50 border-2 border-amber-300/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-amber-400 transition" />
        <button id="submitLineBtn" class="bg-amber-600 hover:bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center transition shadow-md">
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      <div class="flex justify-between items-center mt-3">
        <span class="text-xs text-amber-200/70"><i class="far fa-clock mr-1"></i> 60s per turn</span>
        <button id="endStoryBtn" class="text-xs bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 font-semibold px-3 py-1.5 rounded-full transition backdrop-blur-sm">
          <i class="fas fa-flag-checkered mr-1"></i> End Story
        </button>
      </div>
      <div class="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md rounded-2xl px-4 py-3 border border-amber-700/30 text-xs text-amber-200/90 space-y-1.5 shadow-lg"
           style="font-family: 'Georgia', serif; min-width: 130px;">
        <p class="text-amber-400 font-semibold mb-1 text-center" style="font-size: 11px;">
          <i class="fas fa-palette mr-1"></i>Storytellers
        </p>
        ${renderTurnOrderList(currentPlayers)}
      </div>
    </div>`;
  setTimeout(generateStarsAndFireflies, 100);
  document.getElementById('endStoryBtn').addEventListener('click', () => {
    document.getElementById('endGameModal').classList.remove('hidden');
  });
  const submitLine = () => {
    const input = document.getElementById('storyLineInput');
    const text = input.value.trim();
    if (!text) return;
    socket.emit('storySubmitLine', text);
    input.value = '';
  };
  document.getElementById('submitLineBtn').addEventListener('click', submitLine);
  document.getElementById('storyLineInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitLine();
  });
}
function renderStoryWaitingUI(socket, gameState, currentPlayers) {
  gameState.style.background = 'radial-gradient(ellipse at 50% 80%, #2b1e10 0%, #0d1117 70%)';
  gameState.style.fontFamily = "'Georgia', 'Times New Roman', serif";
  gameState.style.position = 'relative';
  gameState.style.overflow = 'hidden';
  const name = currentTurnId ? getPlayerNameById(currentTurnId, currentPlayers) : 'someone';
  gameState.innerHTML = `
    <div id="starsContainer" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
    <div id="firefliesContainer" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
    <div class="relative flex flex-col h-full p-4 z-10">
      <div class="text-center mb-3">
        <span class="text-xs bg-amber-900/40 text-amber-200 px-3 py-1 rounded-full font-semibold tracking-wide uppercase backdrop-blur-sm">${storyGenre}</span>
        <h2 class="text-2xl font-bold mt-1 text-amber-100" style="font-family: 'Georgia', serif; text-shadow: 0 0 10px rgba(255,180,80,0.5);">
          <i class="fas fa-feather-alt mr-2 text-amber-300"></i>Story Chain
        </h2>
      </div>
      <div class="bg-amber-900/40 text-amber-200 text-sm px-4 py-2 rounded-full text-center mb-3 font-medium backdrop-blur-sm">
        <span class="inline-block w-4 h-4 border-2 border-amber-300/30 border-t-amber-400 rounded-full animate-spin mr-1 align-middle"></span>
        Waiting for <span class="font-semibold">${name}</span> to write...
      </div>
      <div id="storyContent" class="flex-1 bg-amber-50/90 backdrop-blur-sm rounded-2xl p-5 shadow-inner overflow-y-auto mb-4 text-sm leading-relaxed border border-amber-300/60"
           style="font-family: 'Georgia', serif; color: #3b2b1a;">
        ${renderStoryLines(storyLines)}
      </div>
      <div class="flex justify-end mt-3">
        <button id="endStoryBtn" class="text-xs bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 font-semibold px-3 py-1.5 rounded-full transition backdrop-blur-sm">
          <i class="fas fa-flag-checkered mr-1"></i> End Story
        </button>
      </div>
      <div class="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md rounded-2xl px-4 py-3 border border-amber-700/30 text-xs text-amber-200/90 space-y-1.5 shadow-lg"
           style="font-family: 'Georgia', serif; min-width: 130px;">
        <p class="text-amber-400 font-semibold mb-1 text-center" style="font-size: 11px;">
          <i class="fas fa-palette mr-1"></i>Storytellers
        </p>
        ${renderTurnOrderList(currentPlayers)}
      </div>
    </div>`;
  setTimeout(generateStarsAndFireflies, 100);
  document.getElementById('endStoryBtn').addEventListener('click', () => {
    document.getElementById('endGameModal').classList.remove('hidden');
  });
}
function renderTurnOrderList(currentPlayers) {
  if (!turnOrder || turnOrder.length === 0) return '<p class="text-amber-200/40 text-center italic">Loading...</p>';
  return turnOrder.map(id => {
    const p = currentPlayers.find(pl => pl.id === id);
    const name = p ? p.name : 'Unknown';
    const color = playerColors[id] || '#ccc';
    return `<div class="flex items-center gap-1.5">
      <span class="w-3 h-3 rounded-full shrink-0" style="background: ${color}; box-shadow: 0 0 6px ${color};"></span>
      <span class="text-amber-200/70">-</span>
      <span class="truncate">${escapeHtml(name)}${id === socket?.id ? ' (You)' : ''}</span>
    </div>`;
  }).join('');
}
function renderStoryLines(lines) {
  if (!lines || lines.length === 0) return '';
  return lines.map((l, i) =>
    `<span style="color: ${playerColors[l.playerId] || '#E05D5D'}">${escapeHtml(l.text)}</span>${i < lines.length - 1 ? ' ' : ''}`
  ).join('');
}
function generateStarsAndFireflies() {
  const starsContainer = document.getElementById('starsContainer');
  const firefliesContainer = document.getElementById('firefliesContainer');
  if (!starsContainer || !firefliesContainer) return;
  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 60 + '%';
    star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
    star.style.setProperty('--delay', Math.random() * 3 + 's');
    starsContainer.appendChild(star);
  }
  for (let i = 0; i < 8; i++) {
    const fly = document.createElement('div');
    fly.className = 'firefly';
    fly.style.left = Math.random() * 80 + 10 + '%';
    fly.style.top = Math.random() * 60 + 20 + '%';
    fly.style.setProperty('--fly-duration', (Math.random() * 4 + 4) + 's');
    fly.style.setProperty('--fly-delay', Math.random() * 2 + 's');
    firefliesContainer.appendChild(fly);
  }
}
function getPlayerNameById(id, players) {
  const p = players.find(p => p.id === id);
  return p ? p.name : 'Unknown';
}
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
function cleanupStoryChain() {
  storyLines = [];
  storyGenre = '';
  playerColors = {};
  turnOrder = [];
  currentTurnId = null;
  myRole = null;
}
export { renderStoryChain, cleanupStoryChain };
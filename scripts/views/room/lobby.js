import { GAME_REGISTRY } from './gameRegistry.js';
import { showToast } from './ui.js';
function setupLobby(socket) {
  const activeFilters = new Set(['competitive', 'casual', '1v1', '2+', '3-5']);
  renderGameCards(activeFilters);
  document.getElementById('toggleFilterBtn').addEventListener('click', () => {
    document.getElementById('filterPillsContainer').classList.toggle('hidden');
  });
  document.getElementById('filterPillsContainer').addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    const filter = pill.dataset.filter;
    if (activeFilters.has(filter)) {
      activeFilters.delete(filter);
      pill.classList.remove('active');
    } else {
      activeFilters.add(filter);
      pill.classList.add('active');
    }
    renderGameCards(activeFilters);
  });
  document.getElementById('gameSearchInput').addEventListener('input', () => renderGameCards(activeFilters));
  document.getElementById('scrollLeftBtn').addEventListener('click', () => {
    document.getElementById('gameCardsWrapper').scrollBy({ left: -200, behavior: 'smooth' });
  });
  document.getElementById('scrollRightBtn').addEventListener('click', () => {
    document.getElementById('gameCardsWrapper').scrollBy({ left: 200, behavior: 'smooth' });
  });
  document.getElementById('lobbyState').addEventListener('click', (e) => {
    const card = e.target.closest('.mode-card');
    if (!card || card.classList.contains('locked')) return;
    socket.emit('requestGame', card.dataset.game);
  });
  document.getElementById('voteCancelBtn').addEventListener('click', () => {
    document.getElementById('voteModal').classList.add('hidden');
  });
  socket.on('voteStarted', ({ games }) => {
    showToast('Vote started! Cast your vote.');
    renderVoteOptions(games);
    document.getElementById('voteModal').classList.remove('hidden');
  });
  socket.on('voteResult', ({ winningGame }) => {
    const names = {
      'search-engine': 'Human Search Engine',
      'impostor': 'Impostor in the Chat',
      'best-answer': 'Best Answer Wins',
      'buzz-battle': 'Buzz Battle',
      'story-chain': 'Story Chain',
      'scribble': 'Scribble'
    };
    showToast(`Vote ended! Playing: ${names[winningGame] || winningGame}`);
  });
  socket.on('gameRequested', ({ playerName, gameName }) => {
    showToast(`${playerName} wants to play "${gameName}"`);
  });
}
function renderGameCards(activeFilters) {
  const grid = document.getElementById('gameCardsGrid');
  if (!grid) return;
  const searchText = document.getElementById('gameSearchInput')?.value?.toLowerCase() || '';
  const filtered = GAME_REGISTRY.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchText);
    const matchesTags = game.tags.some(tag => activeFilters.has(tag));
    return matchesSearch && matchesTags;
  });
  grid.innerHTML = filtered.map(game => `
    <div class="mode-card bg-white rounded-xl p-3 shadow-sm text-center shrink-0 ${game.locked ? 'locked' : ''}"
         style="width: 140px;" data-game="${game.id}">
      <i class="fas ${game.icon} text-2xl text-${game.color} mb-1"></i>
      <h4 class="font-bold text-sm">${game.name}</h4>
      <span class="text-xs text-navy/50">${game.players}</span>
    </div>
  `).join('');
  updateScrollButtons();
}
function updateScrollButtons() {
  const wrapper = document.getElementById('gameCardsWrapper');
  const leftBtn = document.getElementById('scrollLeftBtn');
  const rightBtn = document.getElementById('scrollRightBtn');
  if (!wrapper || !leftBtn || !rightBtn) return;
  const canScroll = wrapper.scrollWidth > wrapper.clientWidth;
  leftBtn.classList.toggle('hidden', !canScroll || wrapper.scrollLeft <= 0);
  rightBtn.classList.toggle('hidden', !canScroll || wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 2);
}
function renderVoteOptions(games) {
  const optionsDiv = document.getElementById('voteOptions');
  if (!optionsDiv) return;
  const gameNames = {
    'search-engine': 'Human Search Engine',
    'impostor': 'Impostor in the Chat',
    'best-answer': 'Best Answer Wins',
    'buzz-battle': 'Buzz Battle',
    'story-chain': 'Story Chain',
    'scribble': 'Scribble'
  };
  optionsDiv.innerHTML = games.map(gameId => `
    <button class="vote-option w-full bg-warm/80 hover:bg-warm text-navy font-semibold px-4 py-2.5 rounded-full transition text-sm"
            data-game="${gameId}">
      ${gameNames[gameId] || gameId}
    </button>
  `).join('');
  optionsDiv.querySelectorAll('.vote-option').forEach(btn => {
    btn.addEventListener('click', () => {
      socket.emit('castVote', btn.dataset.game);
      document.getElementById('voteModal').classList.add('hidden');
    });
  });
}
function updateGameCards(playerCount) {
  document.querySelectorAll('.mode-card').forEach(card => {
    const minPlayers = { 'search-engine': 2, 'impostor': 3, 'best-answer': 3, 'buzz-battle': 2, 'story-chain': 2, 'scribble': 2 };
    const locked = playerCount < (minPlayers[card.dataset.game] || 2);
    card.classList.toggle('locked', locked);
  });
}
export { setupLobby, updateGameCards };
let engineName = '';
let myRole = null;
let cleanupFunctions = [];
function renderSearchEngine(socket, gameState) {
  gameState.classList.remove('items-center', 'justify-center');
  gameState.innerHTML = `
    <div class="flex items-center justify-center h-full text-navy/60 text-lg">
      <i class="fas fa-spinner fa-spin mr-2"></i> Waiting for role...
    </div>`;
  socket.once('roleAssignment', ({ role }) => {
    myRole = role;
    if (role === 'engine') {
      renderEngineSetup(socket, gameState);
    } else if (role === 'searcher') {
      renderSearcherUI(socket, gameState);
    } else {
      renderSpectatorUI(gameState);
    }
  });
  socket.on('rolesSwapped', ({ engine, searcher }) => {
    if (socket.id === engine) {
      myRole = 'engine';
      renderEngineAnsweringUI(socket, gameState);
    } else if (socket.id === searcher) {
      myRole = 'searcher';
      renderSearcherUI(socket, gameState);
    } else {
      myRole = 'spectator';
      renderSpectatorUI(gameState);
    }
  });
}
function renderEngineSetup(socket, gameState) {
  gameState.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full p-4">
      <div class="text-center max-w-md w-full">
        <i class="fas fa-robot text-6xl text-coral mb-4"></i>
        <h2 class="text-2xl font-display mb-4">You are the Search Engine</h2>
        <p class="text-navy/60 mb-6">Choose your engine's name.</p>
        <input type="text" id="engineNameInput" maxlength="20"
               class="w-full bg-white border-2 border-navy/10 rounded-full px-5 py-3 text-center text-lg focus:outline-none focus:border-coral/50 transition mb-4" />
        <button id="setEngineNameBtn" class="bg-coral hover:bg-coral/90 text-white font-bold px-8 py-3 rounded-full transition shadow-md">
          Start Engine
        </button>
      </div>
    </div>`;
  const submitName = () => {
    const name = document.getElementById('engineNameInput').value.trim();
    if (name) {
      engineName = name;
      socket.emit('setEngineName', name);
      renderEngineAnsweringUI(socket, gameState);
    }
  };
  document.getElementById('setEngineNameBtn').addEventListener('click', submitName);
  document.getElementById('engineNameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitName();
  });
}
function renderEngineAnsweringUI(socket, gameState) {
  gameState.innerHTML = `
    <div class="flex flex-col h-full p-4">
      <div class="text-center mb-4">
        <h3 class="text-3xl" id="engineLogoDisplay" style="font-family: 'Open Sans', sans-serif; font-weight: 600;">
          ${colorizeEngineName(engineName)}
        </h3>
        <p class="text-navy/50 text-sm mt-1">Receiving queries...</p>
      </div>
      <div id="currentQuery" class="bg-white/90 rounded-2xl p-4 mb-4 shadow-sm min-h-[60px] text-navy/70 italic">
        Waiting for a question...
      </div>
      <div class="flex-1 flex flex-col">
        <textarea id="engineResponseInput" placeholder="Waiting for a question..." disabled
          class="flex-1 bg-white border-2 border-navy/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-coral/50 transition resize-none mb-2 opacity-50 cursor-not-allowed"></textarea>
        <div class="flex gap-2 justify-end">
          <button id="engineEndGameBtn" class="bg-softred/20 hover:bg-softred/30 text-softred font-semibold px-4 py-2 rounded-full transition text-sm">
            <i class="fas fa-times mr-1"></i> End
          </button>
          <button id="engineDoneBtn" disabled class="bg-softgreen/50 text-white font-semibold px-6 py-2 rounded-full transition shadow-md cursor-not-allowed">
            <i class="fas fa-check mr-1"></i> Done
          </button>
        </div>
      </div>
    </div>`;
  document.getElementById('engineEndGameBtn').addEventListener('click', () => {
    document.getElementById('endGameModal').classList.remove('hidden');
  });
  socket.on('incomingQuery', ({ query, from }) => {
    document.getElementById('currentQuery').innerHTML = `<span class="font-semibold">${from} asks:</span><br>"${query}"`;
    const textarea = document.getElementById('engineResponseInput');
    const btn = document.getElementById('engineDoneBtn');
    textarea.disabled = false;
    textarea.classList.remove('opacity-50', 'cursor-not-allowed');
    textarea.placeholder = 'Type your answer here...';
    textarea.focus();
    btn.disabled = false;
    btn.classList.remove('bg-softgreen/50', 'cursor-not-allowed');
    btn.classList.add('bg-softgreen', 'hover:bg-softgreen/90');
  });
  const textarea = document.getElementById('engineResponseInput');
  textarea.addEventListener('input', () => {
    socket.emit('engineTyping', textarea.value);
  });
  document.getElementById('engineDoneBtn').addEventListener('click', () => {
    socket.emit('engineDone');
    resetEngineUI();
  });
}
function resetEngineUI() {
  const textarea = document.getElementById('engineResponseInput');
  const btn = document.getElementById('engineDoneBtn');
  if (textarea) {
    textarea.value = '';
    textarea.disabled = true;
    textarea.classList.add('opacity-50', 'cursor-not-allowed');
    textarea.placeholder = 'Waiting for a question...';
  }
  if (btn) {
    btn.disabled = true;
    btn.classList.add('bg-softgreen/50', 'cursor-not-allowed');
    btn.classList.remove('bg-softgreen', 'hover:bg-softgreen/90');
  }
}
function renderSearcherUI(socket, gameState) {
  gameState.classList.add('bg-white');
  gameState.innerHTML = `
    <div class="flex flex-col h-full">
      <div class="flex justify-end px-4 pt-2">
        <button id="searcherEndGameBtn" class="text-xs bg-softred/10 hover:bg-softred/20 text-softred font-semibold px-3 py-1.5 rounded-full transition">
          <i class="fas fa-times mr-1"></i> End Game
        </button>
      </div>
      <div class="flex flex-col items-center pt-16 pb-6 px-4 flex-shrink-0">
        <div id="engineLogo" class="text-4xl md:text-5xl mb-6 tracking-tight" style="font-family: 'Open Sans', sans-serif; font-weight: 600;">
          ${engineName ? colorizeEngineName(engineName) : '<span class="text-navy/40">Search Engine</span>'}
        </div>
        <div class="w-full max-w-lg relative">
          <input type="text" id="searchQueryInput" placeholder="Search anything..."
                 style="font-family: 'Open Sans', sans-serif;"
                 class="w-full bg-white border-2 border-navy/15 hover:border-coral/40 focus:border-coral rounded-full px-6 py-4 text-lg shadow-sm focus:shadow-md outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                 ${!engineName ? 'disabled' : ''} />
          <button id="searchSubmitBtn"
                  class="absolute right-2 top-1/2 -translate-y-1/2 bg-coral hover:bg-coral/90 text-white rounded-full w-10 h-10 flex items-center justify-center transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  ${!engineName ? 'disabled' : ''}>
            <i class="fas fa-search"></i>
          </button>
        </div>
        <p id="searcherStatus" class="text-navy/40 text-sm mt-3 h-5">
          ${engineName ? '' : 'Waiting for the engine to start...'}
        </p>
      </div>
      <div id="searchResults" class="flex-1 overflow-y-auto px-4 pb-8 max-w-2xl mx-auto w-full space-y-6">
        <div class="text-navy/30 text-center py-8">Results will appear here...</div>
      </div>
      <div id="engineLiveTyping" class="text-xs text-navy/40 italic px-6 py-2 border-t border-navy/5 bg-warm/50 text-center"></div>
    </div>`;
  document.getElementById('searcherEndGameBtn').addEventListener('click', () => {
    document.getElementById('endGameModal').classList.remove('hidden');
  });
  socket.on('engineNameSet', ({ name }) => {
    engineName = name;
    document.getElementById('engineLogo').innerHTML = colorizeEngineName(name);
    document.getElementById('searcherStatus').textContent = '';
    const input = document.getElementById('searchQueryInput');
    const btn = document.getElementById('searchSubmitBtn');
    input.disabled = false;
    input.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
    btn.disabled = false;
    btn.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });
  socket.on('engineResponse', ({ text }) => {
    document.getElementById('engineLiveTyping').textContent = text;
  });
  socket.on('answerComplete', () => {
    const finalText = document.getElementById('engineLiveTyping').textContent;
    if (finalText) {
      const resultsDiv = document.getElementById('searchResults');
      const empty = resultsDiv.querySelector('.text-center');
      if (empty) empty.remove();
      const resultCard = document.createElement('div');
      resultCard.className = 'bg-white rounded-xl p-4 shadow-sm border border-navy/5';
      resultCard.innerHTML = `
        <div class="text-xs text-green-700 mb-1">${engineName ? engineName.toLowerCase() + '.kifuga' : 'search.kifuga'} › answer</div>
        <h3 class="text-lg text-blue-700 font-semibold cursor-pointer hover:underline">${escapeHtml(engineName || 'Search Engine')} says:</h3>
        <p class="text-sm text-navy/80 mt-1">${escapeHtml(finalText)}</p>
      `;
      resultsDiv.appendChild(resultCard);
      const input = document.getElementById('searchQueryInput');
      const btn = document.getElementById('searchSubmitBtn');
      input.disabled = false;
      input.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
      btn.disabled = false;
      btn.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
      document.getElementById('searcherStatus').textContent = '';
      input.focus();
      document.getElementById('engineLiveTyping').textContent = '';
    }
  });
  const sendQuery = () => {
    const input = document.getElementById('searchQueryInput');
    if (input.disabled) return;
    const query = input.value.trim();
    if (!query) return;
    socket.emit('searchQuery', query);
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    const queryCard = document.createElement('div');
    queryCard.className = 'bg-warm/50 rounded-xl p-4 border border-navy/5';
    queryCard.innerHTML = `
      <div class="text-xs text-navy/50 mb-1">You asked</div>
      <p class="text-sm font-medium text-navy">${escapeHtml(query)}</p>
    `;
    resultsDiv.appendChild(queryCard);
    input.value = '';
    input.disabled = true;
    input.classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');
    document.getElementById('searchSubmitBtn').disabled = true;
    document.getElementById('searchSubmitBtn').classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');
    document.getElementById('searcherStatus').textContent = 'Waiting for answer...';
  };
  document.getElementById('searchSubmitBtn').addEventListener('click', sendQuery);
  document.getElementById('searchQueryInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendQuery();
  });
}
function renderSpectatorUI(gameState) {
  gameState.innerHTML = `
    <div class="flex items-center justify-center h-full text-navy/60 text-lg">
      <i class="fas fa-eye mr-2"></i> You are spectating. Enjoy the show!
    </div>`;
}
function colorizeEngineName(name) {
  const colors = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];
  return name.split('').map((letter, i) =>
    `<span style="color: ${colors[i % colors.length]}">${letter}</span>`
  ).join('');
}
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
function cleanupSearchEngine() {
  engineName = '';
  myRole = null;
}
export { renderSearchEngine, cleanupSearchEngine };
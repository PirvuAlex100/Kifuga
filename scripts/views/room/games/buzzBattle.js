let buzzMyTurn = false;
let buzzTimerInterval = null;
function renderBuzzBattleUI(socket, gameState, isHost, currentPlayers) {
  gameState.classList.remove('items-center', 'justify-center');
  gameState.classList.add('bg-cream');
  gameState.innerHTML = `
    <div class="flex flex-col h-full p-4 relative">
      <div class="flex justify-between items-center mb-4">
        <span id="buzzProgress" class="text-sm text-navy/60 font-semibold"></span>
        ${isHost ? `<button id="buzzSkipBtn" class="text-xs bg-softred/10 hover:bg-softred/20 text-softred px-3 py-1 rounded-full transition">
          <i class="fas fa-forward mr-1"></i> Skip
        </button>` : ''}
      </div>
      <div class="flex-1 flex flex-col items-center justify-center text-center">
        <div id="buzzTimer" class="text-4xl font-bold text-coral mb-4 hidden">
          <span id="buzzTimerValue">8</span>s
        </div>
        <h2 id="buzzQuestionText" class="text-2xl md:text-3xl font-display text-navy mb-8"></h2>
        <button id="buzzBtn" class="hidden relative w-36 h-36 rounded-full bg-gradient-to-b from-red-500 to-red-700 text-white font-extrabold text-xl shadow-[0_8px_0_#991b1b,0_12px_24px_rgba(0,0,0,0.4)] active:shadow-[0_2px_0_#991b1b,0_4px_12px_rgba(0,0,0,0.4)] active:translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-[0_8px_0_#991b1b,0_12px_24px_rgba(0,0,0,0.4)] flex items-center justify-center mx-auto"
             style="border: 3px solid #fecaca;">
          <span class="absolute inset-2 rounded-full border-2 border-white/20"></span>
          <span class="relative z-10 flex flex-col items-center">
            <i class="fas fa-bell text-2xl mb-0.5"></i>
            <span class="text-sm tracking-wider">BUZZ</span>
          </span>
        </button>
        <div id="buzzAnswerArea" class="hidden w-full max-w-md">
          <div class="bg-softgreen/10 border border-softgreen/30 text-softgreen rounded-full px-4 py-2 text-sm mb-4">
            <i class="fas fa-pencil-alt mr-1"></i> Your turn! Answer quickly.
          </div>
          <div class="flex gap-2">
            <input type="text" id="buzzAnswerInput" maxlength="100" placeholder="Type your answer..."
              class="flex-1 bg-white border-2 border-navy/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-coral/50 transition" />
            <button id="buzzSubmitBtn" class="bg-coral hover:bg-coral/90 text-white rounded-full w-12 h-12 flex items-center justify-center transition shadow-md">
              <i class="fas fa-check"></i>
            </button>
          </div>
        </div>
        <div id="buzzStatus" class="text-navy/50 text-sm mt-6 h-6"></div>
      </div>
      <div id="buzzOrderList" class="absolute bottom-4 right-4 text-xs text-navy/40 flex items-center gap-2 hidden">
        <i class="fas fa-list-ol"></i> <span id="buzzOrderText"></span>
      </div>
    </div>`;
  const buzzSound = new Audio('/sounds/games/buzz-battle/buzz.wav');
  const suspenseSound = new Audio('/sounds/games/buzz-battle/suspense.wav');
  suspenseSound.loop = true;
  document.getElementById('buzzBtn').addEventListener('click', () => {
    socket.emit('buzz');
    buzzSound.currentTime = 0;
    buzzSound.play().catch(() => {});
    document.getElementById('buzzBtn').disabled = true;
    document.getElementById('buzzStatus').textContent = 'Buzz sent! Waiting...';
  });
  const submitAnswer = () => {
    const text = document.getElementById('buzzAnswerInput').value.trim();
    if (text) {
      socket.emit('buzzAnswer', text);
      document.getElementById('buzzAnswerArea').classList.add('hidden');
      document.getElementById('buzzStatus').textContent = 'Answer submitted!';
    }
  };
  document.getElementById('buzzSubmitBtn').addEventListener('click', submitAnswer);
  document.getElementById('buzzAnswerInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAnswer();
  });
  if (isHost) {
    document.getElementById('buzzSkipBtn').addEventListener('click', () => socket.emit('buzzSkip'));
  }
  socket.on('buzzSound', () => {
    buzzSound.currentTime = 0;
    buzzSound.play().catch(() => {});
  });
  socket.on('buzzQuestion', ({ question, index, total }) => {
    buzzMyTurn = false;
    document.getElementById('buzzQuestionText').textContent = question;
    document.getElementById('buzzProgress').textContent = `Question ${index} of ${total}`;
    document.getElementById('buzzBtn').classList.remove('hidden');
    document.getElementById('buzzBtn').disabled = false;
    document.getElementById('buzzAnswerArea').classList.add('hidden');
    document.getElementById('buzzStatus').textContent = 'Buzz in!';
    document.getElementById('buzzOrderList').classList.add('hidden');
    let timerValue = 8;
    document.getElementById('buzzTimer').classList.remove('hidden');
    document.getElementById('buzzTimerValue').textContent = timerValue;
    clearInterval(buzzTimerInterval);
    buzzTimerInterval = setInterval(() => {
      timerValue--;
      if (timerValue <= 0) {
        clearInterval(buzzTimerInterval);
        document.getElementById('buzzTimerValue').textContent = '0';
        document.getElementById('buzzBtn').classList.add('hidden');
        document.getElementById('buzzStatus').textContent = "Time's up!";
      } else {
        document.getElementById('buzzTimerValue').textContent = timerValue;
      }
    }, 1000);
  });
  socket.on('buzzUpdate', ({ buzzOrder }) => {
    document.getElementById('buzzOrderList').classList.remove('hidden');
    document.getElementById('buzzOrderText').textContent = buzzOrder.length + ' buzzed';
  });
  socket.on('buzzTimeout', () => {
    clearInterval(buzzTimerInterval);
    suspenseSound.pause();
    document.getElementById('buzzBtn').classList.add('hidden');
    document.getElementById('buzzTimer').classList.add('hidden');
    document.getElementById('buzzStatus').textContent = 'No one buzzed. Next question...';
  });
  socket.on('buzzTurn', ({ playerId }) => {
    clearInterval(buzzTimerInterval);
    document.getElementById('buzzTimer').classList.add('hidden');
    document.getElementById('buzzBtn').classList.add('hidden');
    if (playerId === socket.id) {
      buzzMyTurn = true;
      suspenseSound.currentTime = 0;
      suspenseSound.play().catch(() => {});
      document.getElementById('buzzAnswerArea').classList.remove('hidden');
      document.getElementById('buzzAnswerInput').value = '';
      document.getElementById('buzzAnswerInput').focus();
    } else {
      const name = getPlayerNameById(playerId, currentPlayers);
      document.getElementById('buzzStatus').textContent = name + ' is answering...';
    }
  });
  socket.on('buzzResult', ({ playerId, correct, answer }) => {
    if (buzzMyTurn) document.getElementById('buzzAnswerArea').classList.add('hidden');
    buzzMyTurn = false;
    suspenseSound.pause();
    const name = playerId === socket.id ? 'You' : getPlayerNameById(playerId, currentPlayers);
    document.getElementById('buzzStatus').innerHTML = correct
      ? `<span class="text-green-600">${name} got it right! (+1)</span>`
      : `<span class="text-red-500">${name} was wrong (-1). Correct answer: ${answer}</span>`;
    document.getElementById('buzzBtn').classList.add('hidden');
  });
  socket.on('buzzSkipped', () => {
    clearInterval(buzzTimerInterval);
    document.getElementById('buzzBtn').classList.add('hidden');
    document.getElementById('buzzTimer').classList.add('hidden');
    document.getElementById('buzzStatus').textContent = 'Host skipped the question.';
  });
  socket.on('buzzGameOver', ({ scores }) => {
    let html = `<div class="flex flex-col items-center justify-center h-full p-4 text-center">
      <i class="fas fa-trophy text-6xl text-coral mb-4"></i>
      <h2 class="text-2xl font-display">Buzz Battle Over!</h2>
      <div class="mt-4 space-y-2">`;
    for (const [id, score] of Object.entries(scores)) {
      const name = getPlayerNameById(id, currentPlayers);
      html += `<div class="flex items-center gap-2 text-sm"><span class="font-semibold">${name}:</span> ${score} pts</div>`;
    }
    html += `</div></div>`;
    gameState.innerHTML = html;
  });
}
function getPlayerNameById(id, players) {
  const p = players.find(p => p.id === id);
  return p ? p.name : 'Unknown';
}
function cleanupBuzzBattle() {
  clearInterval(buzzTimerInterval);
  buzzMyTurn = false;
}
export { renderBuzzBattleUI, cleanupBuzzBattle };
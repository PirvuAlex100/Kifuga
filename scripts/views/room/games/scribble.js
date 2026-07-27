let scribbleDrawing = false;
let scribbleCurrentStroke = [];
let scribbleBrushSize = 3;
let scribbleBrushColor = '#000000';
let scribbleTimerInterval = null;
let scribbleTimeLeft = 60;
let myRole = null;
let hasGuessed = false;
let roleHandler = null;
let listenersSetup = false;
let scribbleMessagesStore = [];
const MAX_MESSAGES = 10;
function spawnConfetti() {
  const horn = new Audio('/sounds/general/horn.mp3');
  horn.volume = 0.5;
  horn.play().catch(() => {});
  const colors = ['#FF6B5E', '#F4C542', '#5E9B9A', '#6C8EBF', '#9B7EBD', '#FFD166', '#EF476F'];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece fixed animate-confetti-fall';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = -(Math.random() * 20 + 10) + 'px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = (Math.random() * 8 + 4) + 'px';
    confetti.style.height = (Math.random() * 8 + 4) + 'px';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}
if (!document.getElementById('confetti-style')) {
  const style = document.createElement('style');
  style.id = 'confetti-style';
  style.textContent = `
    .confetti-piece {
      position: absolute;
      border-radius: 2px;
      pointer-events: none;
      z-index: 999;
    }
    @keyframes confettiFall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
function renderScribbleUI(socket, gameState) {
  gameState.classList.remove('items-center', 'justify-center');
  gameState.innerHTML = `
    <div class="flex items-center justify-center h-full text-navy/60 text-lg">
      <i class="fas fa-spinner fa-spin mr-2"></i> Waiting for role...
    </div>`;
  if (roleHandler) {
    socket.off('roleAssignment', roleHandler);
  }
  roleHandler = ({ role, word }) => {
    myRole = role;
    hasGuessed = false;
    if (role === 'drawer') {
      renderScribbleDrawerUI(socket, gameState, word);
    } else if (role === 'guesser') {
      renderScribbleGuesserUI(socket, gameState);
    }
  };
  socket.on('roleAssignment', roleHandler);
  setupScribbleListeners(socket);
}
function setupScribbleListeners(socket) {
  if (listenersSetup) return;
  listenersSetup = true;
  socket.on('scribbleChatMessage', (msg) => {
    scribbleMessagesStore.push({
      system: msg.system || false,
      senderName: msg.senderName,
      text: msg.text
    });
    if (scribbleMessagesStore.length > MAX_MESSAGES) {
      scribbleMessagesStore = scribbleMessagesStore.slice(-MAX_MESSAGES);
    }
    const messagesDiv = document.getElementById('scribbleMessages');
    if (!messagesDiv) return;
    const empty = messagesDiv.querySelector('.text-center');
    if (empty) empty.remove();
    const div = document.createElement('div');
    if (msg.system) {
      div.className = 'text-center text-navy/40 italic text-xs';
      div.textContent = msg.text;
    } else {
      div.className = 'flex items-start gap-1';
      div.innerHTML = `<span class="font-semibold text-coral shrink-0">${msg.senderName}:</span> <span class="text-navy/80">${msg.text}</span>`;
    }
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
  socket.on('scribbleCorrect', ({ guesser, word }) => {
    clearInterval(scribbleTimerInterval);
    if (guesser === socket.id) {
      spawnConfetti();
      const chatInput = document.getElementById('scribbleChatInput');
      const sendBtn = document.getElementById('scribbleChatSend');
      if (chatInput) {
        hasGuessed = true;
        chatInput.disabled = true;
        sendBtn.disabled = true;
        chatInput.placeholder = 'You got it!';
      }
    }
  });
  socket.on('scribbleWrong', () => {
    const resultEl = document.getElementById('scribbleGuessResult');
    if (resultEl) {
      resultEl.innerHTML = '<span class="text-red-500">Wrong, try again!</span>';
      setTimeout(() => { resultEl.textContent = ''; }, 1500);
    }
  });
  socket.on('scribbleTimeout', () => {
    clearInterval(scribbleTimerInterval);
  });
}
function renderStoredMessages() {
  const messagesDiv = document.getElementById('scribbleMessages');
  if (!messagesDiv) return;
  const empty = messagesDiv.querySelector('.text-center');
  if (empty) empty.remove();
  scribbleMessagesStore.forEach(msg => {
    const div = document.createElement('div');
    if (msg.system) {
      div.className = 'text-center text-navy/40 italic text-xs';
      div.textContent = msg.text;
    } else {
      div.className = 'flex items-start gap-1';
      div.innerHTML = `<span class="font-semibold text-coral shrink-0">${msg.senderName}:</span> <span class="text-navy/80">${msg.text}</span>`;
    }
    messagesDiv.appendChild(div);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
function renderScribbleDrawerUI(socket, gameState, word) {
  gameState.style.overflow = 'hidden';
  gameState.innerHTML = `
    <div class="flex flex-col h-full p-4">
      <div class="flex items-center justify-between mb-2 shrink-0">
        <div class="bg-softgreen/20 text-green-700 text-lg font-bold px-4 py-2 rounded-full">
          <i class="fas fa-paint-brush mr-2"></i> Draw: <span class="uppercase">${word}</span>
        </div>
        <div class="flex items-center gap-2">
          <span id="scribbleTimer" class="text-lg font-bold text-coral">60s</span>
          <button id="scribbleEndBtn" class="bg-softred/20 hover:bg-softred/30 text-softred text-sm px-3 py-1.5 rounded-full transition">
            <i class="fas fa-times mr-1"></i> End Game
          </button>
          <button id="scribbleClearBtn" class="bg-navy/10 hover:bg-navy/20 text-navy text-sm px-3 py-1.5 rounded-full transition">
            <i class="fas fa-eraser mr-1"></i> Clear
          </button>
        </div>
      </div>
      <div class="flex gap-2 mb-2 shrink-0">
        ${[2,4,6,10].map(s => `<button class="brush-size-btn px-3 py-1 rounded-full text-xs font-semibold transition ${s === scribbleBrushSize ? 'bg-navy text-white' : 'bg-white text-navy border'}" data-size="${s}">${s}px</button>`).join('')}
        <input type="color" id="scribbleColor" value="${scribbleBrushColor}" class="w-8 h-8 rounded cursor-pointer" />
      </div>
      <canvas id="scribbleCanvas" class="flex-1 min-h-0 bg-white rounded-2xl shadow-inner w-full overflow-hidden mb-2" style="touch-action: none;"></canvas>
      <div id="scribbleMessages" class="bg-white/90 rounded-xl p-2 shadow-inner overflow-y-auto text-xs space-y-1 mb-2" style="height: 120px;">
        <div class="text-center text-navy/30 text-xs py-4">Chat is empty</div>
      </div>
    </div>`;
  setupScribbleCanvas(socket, true);
  startScribbleTimer();
  renderStoredMessages();
  document.getElementById('scribbleEndBtn').addEventListener('click', () => {
    document.getElementById('endGameModal').classList.remove('hidden');
  });
  document.getElementById('scribbleClearBtn').addEventListener('click', () => {
    const canvas = document.getElementById('scribbleCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    socket.emit('scribbleClear');
  });
  document.querySelectorAll('.brush-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      scribbleBrushSize = parseInt(btn.dataset.size);
      document.querySelectorAll('.brush-size-btn').forEach(b => {
        b.classList.remove('bg-navy', 'text-white');
        b.classList.add('bg-white', 'text-navy', 'border');
      });
      btn.classList.add('bg-navy', 'text-white');
      btn.classList.remove('bg-white', 'border');
    });
  });
  document.getElementById('scribbleColor').addEventListener('input', (e) => {
    scribbleBrushColor = e.target.value;
  });
}
function renderScribbleGuesserUI(socket, gameState) {
  gameState.style.overflow = 'hidden';
  gameState.innerHTML = `
    <div class="flex flex-col h-full p-4">
      <div class="flex items-center justify-between mb-2 shrink-0">
        <div class="bg-coral/20 text-coral font-bold px-4 py-2 rounded-full">
          <i class="fas fa-lightbulb mr-2"></i> Guess the drawing!
        </div>
        <div class="flex items-center gap-2">
          <span id="scribbleTimer" class="text-lg font-bold text-coral">60s</span>
          <button id="scribbleEndBtn" class="bg-softred/20 hover:bg-softred/30 text-softred text-sm px-3 py-1.5 rounded-full transition">
            <i class="fas fa-times mr-1"></i> End Game
          </button>
        </div>
      </div>
      <canvas id="scribbleCanvas" class="flex-1 min-h-0 bg-white rounded-2xl shadow-inner w-full overflow-hidden mb-2" style="touch-action: none;"></canvas>
      <div class="flex flex-col shrink-0" style="height: 140px;">
        <div id="scribbleMessages" class="flex-1 bg-white/90 rounded-xl p-2 shadow-inner overflow-y-auto text-xs space-y-1 mb-2">
          <div class="text-center text-navy/30 text-xs py-4">Chat is empty</div>
        </div>
        <div class="flex gap-1">
          <input type="text" id="scribbleChatInput" placeholder="Type your guess..." maxlength="100"
                 class="flex-1 bg-white border-2 border-navy/10 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-coral/50 transition" />
          <button id="scribbleChatSend" class="bg-coral hover:bg-coral/90 text-white rounded-full w-7 h-7 flex items-center justify-center transition shadow-sm shrink-0">
            <i class="fas fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>`;
  setupScribbleCanvas(socket, false);
  setupScribbleChatInput(socket);
  startScribbleTimer();
  renderStoredMessages();
  document.getElementById('scribbleEndBtn').addEventListener('click', () => {
    document.getElementById('endGameModal').classList.remove('hidden');
  });
}
function setupScribbleChatInput(socket) {
  const chatInput = document.getElementById('scribbleChatInput');
  const sendBtn = document.getElementById('scribbleChatSend');
  if (!chatInput) return;
  hasGuessed = false;
  chatInput.disabled = false;
  sendBtn.disabled = false;
  chatInput.placeholder = 'Type your guess...';
  function send() {
    const text = chatInput.value.trim();
    if (!text) return;
    if (hasGuessed) {
      socket.emit('scribbleWrong', { message: 'You already guessed!' });
      return;
    }
    socket.emit('scribbleGuess', text);
    chatInput.value = '';
  }
  sendBtn.addEventListener('click', send);
  chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') send(); });
}
function setupScribbleCanvas(socket, isDrawer) {
  const canvas = document.getElementById('scribbleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const resizeObserver = new ResizeObserver(() => {
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width;
    canvas.height = r.height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
  resizeObserver.observe(canvas);
  if (isDrawer) {
    canvas.addEventListener('mousedown', (e) => startStroke(e, canvas, socket));
    canvas.addEventListener('mousemove', (e) => drawStroke(e, canvas, socket));
    canvas.addEventListener('mouseup', () => endStroke(socket));
    canvas.addEventListener('mouseleave', () => endStroke(socket));
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startStroke(e.touches[0], canvas, socket); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawStroke(e.touches[0], canvas, socket); });
    canvas.addEventListener('touchend', () => endStroke(socket));
  }
  socket.on('scribbleStroke', (data) => {
    const ctx2 = canvas.getContext('2d');
    ctx2.strokeStyle = data.color;
    ctx2.fillStyle = data.color;
    ctx2.lineWidth = data.size;
    ctx2.lineCap = 'round';
    ctx2.lineJoin = 'round';
    if (data.points.length === 1) {
      ctx2.beginPath();
      ctx2.arc(data.points[0].x, data.points[0].y, data.size / 2, 0, 2 * Math.PI);
      ctx2.fill();
    } else if (data.points.length > 1) {
      ctx2.beginPath();
      ctx2.moveTo(data.points[0].x, data.points[0].y);
      for (let i = 1; i < data.points.length; i++) {
        ctx2.lineTo(data.points[i].x, data.points[i].y);
      }
      ctx2.stroke();
    }
  });
  socket.on('scribbleClear', () => {
    const ctx2 = canvas.getContext('2d');
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    ctx2.fillStyle = '#ffffff';
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
  });
}
function getPos(e, canvas) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height)
  };
}
function startStroke(e, canvas, socket) {
  scribbleDrawing = true;
  scribbleCurrentStroke = [];
  const pos = getPos(e, canvas);
  scribbleCurrentStroke.push(pos);
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}
function drawStroke(e, canvas, socket) {
  if (!scribbleDrawing) return;
  const pos = getPos(e, canvas);
  scribbleCurrentStroke.push(pos);
  const ctx = canvas.getContext('2d');
  ctx.lineTo(pos.x, pos.y);
  ctx.strokeStyle = scribbleBrushColor;
  ctx.lineWidth = scribbleBrushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  socket.emit('scribbleStroke', {
    points: [{ x: pos.x, y: pos.y }],
    color: scribbleBrushColor,
    size: scribbleBrushSize
  });
}
function endStroke(socket) {
  if (!scribbleDrawing) return;
  scribbleDrawing = false;
  if (scribbleCurrentStroke.length > 0) {
    socket.emit('scribbleStroke', {
      points: scribbleCurrentStroke,
      color: scribbleBrushColor,
      size: scribbleBrushSize
    });
    scribbleCurrentStroke = [];
  }
}
function startScribbleTimer() {
  scribbleTimeLeft = 60;
  clearInterval(scribbleTimerInterval);
  const el = document.getElementById('scribbleTimer');
  if (el) { el.textContent = scribbleTimeLeft + 's'; el.className = 'text-lg font-bold text-green-600'; }
  scribbleTimerInterval = setInterval(() => {
    scribbleTimeLeft--;
    if (!el) { clearInterval(scribbleTimerInterval); return; }
    el.textContent = scribbleTimeLeft + 's';
    if (scribbleTimeLeft > 30) el.className = 'text-lg font-bold text-green-600';
    else if (scribbleTimeLeft > 10) el.className = 'text-lg font-bold text-yellow-500';
    else el.className = 'text-lg font-bold text-red-500';
    if (scribbleTimeLeft <= 0) clearInterval(scribbleTimerInterval);
  }, 1000);
}
function cleanupScribble(socket) {
  clearInterval(scribbleTimerInterval);
  scribbleDrawing = false;
  scribbleCurrentStroke = [];
  scribbleMessagesStore = [];
  myRole = null;
  hasGuessed = false;
  if (roleHandler) { socket.off('roleAssignment', roleHandler); roleHandler = null; }
  socket.off('scribbleChatMessage');
  socket.off('scribbleCorrect');
  socket.off('scribbleWrong');
  socket.off('scribbleTimeout');
  listenersSetup = false;
}
export { renderScribbleUI, cleanupScribble };
function setupChat(socket) {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendChatBtn');
  const chatArea = document.getElementById('chatArea');
  const typingIndicator = document.getElementById('typingIndicator');
  const typingUsers = {};
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    socket.emit('chatMessage', message);
    chatInput.value = '';
  }
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  let typingTimeout;
  chatInput.addEventListener('input', () => {
    socket.emit('typing');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stopTyping');
    }, 1500);
  });
  socket.on('chatMessage', (msg) => {
    const empty = chatArea.querySelector('.text-center');
    if (empty) empty.remove();
    const div = document.createElement('div');
    div.className = 'flex items-start gap-2 animate-fade-up';
    if (!msg.system) div.dataset.senderId = msg.senderId;
    div.innerHTML = msg.system
      ? `<div class="w-full text-center text-xs text-navy/50 italic py-1">${msg.text}</div>`
      : `<div class="w-7 h-7 rounded-full bg-coral/20 text-coral flex items-center justify-center text-xs font-bold shrink-0">${msg.senderName.charAt(0).toUpperCase()}</div>
         <div class="bg-warm/80 rounded-2xl rounded-tl-sm px-3 py-2 text-sm shadow-sm">
           <span class="font-semibold text-coral">${msg.senderName}</span> ${msg.text}
         </div>`;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
  });
  socket.on('userTyping', ({ socketId, name }) => {
    typingUsers[socketId] = name;
    updateTypingIndicator(typingIndicator, typingUsers);
  });
  socket.on('userStoppedTyping', ({ socketId }) => {
    delete typingUsers[socketId];
    updateTypingIndicator(typingIndicator, typingUsers);
  });
  socket.on('clearPlayerChat', (targetId) => {
    const messages = chatArea.querySelectorAll(`.flex[data-sender-id="${targetId}"]`);
    messages.forEach(msg => msg.remove());
    if (!chatArea.querySelector('.flex')) {
      chatArea.innerHTML = `
        <div class="text-center text-navy/30 text-sm py-8">
          <i class="fas fa-comments text-3xl mb-2 block"></i>
          Chat is empty. Say hi!
        </div>`;
    }
  });
}
function updateTypingIndicator(el, typingUsers) {
  if (!el) return;
  const names = Object.values(typingUsers);
  if (names.length === 0) {
    el.textContent = '';
  } else if (names.length === 1) {
    el.textContent = names[0] + ' is typing...';
  } else {
    el.textContent = names.join(', ') + ' are typing...';
  }
}
export { setupChat };
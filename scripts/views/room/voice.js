let localStream = null;
let isMicOn = false;
let audioContext = null;
let analyser = null;
const peerConnections = {};
const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
function setupVoice(socket) {
  const micBtn = document.getElementById('micToggleBtn');
  if (!micBtn) return;
  micBtn.addEventListener('click', () => toggleMic(socket));
  socket.on('webrtc-offer', handleOffer);
  socket.on('webrtc-answer', handleAnswer);
  socket.on('webrtc-ice-candidate', handleIceCandidate);
  socket.on('speaking', handleRemoteSpeaking);
  socket.on('roomUpdate', (state) => {
    if (!state || !localStream) return;
    state.players.forEach(player => {
      if (player.id !== socket.id) {
        createPeerConnection(socket, player.id);
      }
    });
  });
}
async function toggleMic(socket) {
  const micBtn = document.getElementById('micToggleBtn');
  if (!isMicOn) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isMicOn = true;
      micBtn.classList.add('bg-coral/20', 'border-coral');
      micBtn.querySelector('i').classList.add('text-coral');
      Object.values(peerConnections).forEach(pc => {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      });
      setupAudioActivity(socket, localStream);
    } catch (err) {
      alert('Could not access microphone.');
      console.error(err);
    }
  } else {
    cleanupVoice(socket);
    micBtn.classList.remove('bg-coral/20', 'border-coral');
    micBtn.querySelector('i').classList.remove('text-coral');
  }
}
async function createPeerConnection(socket, remoteSocketId) {
  if (peerConnections[remoteSocketId]) return;
  const pc = new RTCPeerConnection(rtcConfig);
  peerConnections[remoteSocketId] = pc;
  if (localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('webrtc-ice-candidate', { to: remoteSocketId, candidate: event.candidate });
    }
  };
  pc.ontrack = (event) => {
    const audio = new Audio();
    audio.srcObject = event.streams[0];
    audio.play().catch(() => {});
  };
  if (socket.id < remoteSocketId) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { to: remoteSocketId, offer });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  }
}
async function handleOffer({ from, offer }) {
  let pc = peerConnections[from];
  if (!pc) {
    pc = new RTCPeerConnection(rtcConfig);
    peerConnections[from] = pc;
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('webrtc-ice-candidate', { to: from, candidate: e.candidate });
    };
    pc.ontrack = (e) => {
      const a = new Audio();
      a.srcObject = e.streams[0];
      a.play().catch(() => {});
    };
  }
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('webrtc-answer', { to: from, answer });
  } catch (err) {
    console.error('Error handling offer:', err);
  }
}
async function handleAnswer({ from, answer }) {
  const pc = peerConnections[from];
  if (pc) {
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  }
}
async function handleIceCandidate({ from, candidate }) {
  const pc = peerConnections[from];
  if (pc) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  }
}
function setupAudioActivity(socket, stream) {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    function checkAudio() {
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const volume = Math.min(1, avg / 80);
      socket.emit('speaking', { volume });
      updateOwnCardGlow(volume);
      requestAnimationFrame(checkAudio);
    }
    checkAudio();
  } catch (err) {
    console.error('Audio activity setup error:', err);
  }
}
function updateOwnCardGlow(volume) {
  const items = document.querySelectorAll('#playerList li');
  items.forEach(item => {
    const nameSpan = item.querySelector('span.font-semibold');
    if (nameSpan && nameSpan.textContent.includes('(You)')) {
      const intensity = Math.min(1, volume * 1.2);
      const spread = 6 + volume * 20;
      item.style.boxShadow = volume > 0.02
        ? `0 0 ${spread}px rgba(87, 242, 135, ${intensity})`
        : 'none';
      item.style.transition = 'box-shadow 0.05s ease';
    }
  });
}
function handleRemoteSpeaking({ socketId, volume }) {
  const items = document.querySelectorAll('#playerList li');
  items.forEach(item => {
    const nameSpan = item.querySelector('span.font-semibold');
    if (nameSpan && !nameSpan.textContent.includes('(You)') && item.dataset.playerId === socketId) {
      const intensity = Math.min(1, volume * 1.2);
      const spread = 6 + volume * 20;
      item.style.boxShadow = volume > 0.02
        ? `0 0 ${spread}px rgba(87, 242, 135, ${intensity})`
        : 'none';
      item.style.transition = 'box-shadow 0.05s ease';
    }
  });
}
function cleanupVoice(socket) {
  if (audioContext) { audioContext.close(); audioContext = null; analyser = null; }
  Object.values(peerConnections).forEach(pc => pc.close());
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; isMicOn = false; }
}
export { setupVoice, createPeerConnection, cleanupVoice, isMicOn };
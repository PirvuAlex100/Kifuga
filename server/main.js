const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, '..')));
app.use((req, res) => {
  if (req.url.startsWith('/socket.io/') || req.url.startsWith('/scripts/') || req.url.startsWith('/styles/') || req.url.startsWith('/images/') || req.url.startsWith('/sounds/') || req.url.startsWith('/svg/')) {
    return res.status(404).end();
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});
const rooms = {};
const buzzQuestions = [
  { question: "What is the capital of France?", answer: "paris" },
  { question: "How many continents are there on Earth?", answer: "7" },
  { question: "What planet is closest to the Sun?", answer: "mercury" },
  { question: "What is the largest ocean on Earth?", answer: "pacific" },
  { question: "What gas do plants absorb from the atmosphere?", answer: "carbon dioxide" },
  { question: "How many bones are in the adult human body?", answer: "206" },
  { question: "What element has the chemical symbol 'O'?", answer: "oxygen" },
  { question: "In what year did World War II end?", answer: "1945" },
  { question: "What is the hardest natural substance?", answer: "diamond" },
  { question: "Who painted the Mona Lisa?", answer: "leonardo da vinci" },
  { question: "What is the longest river in the world?", answer: "nile" },
  { question: "What language has the most native speakers?", answer: "mandarin" },
  { question: "How many sides does a hexagon have?", answer: "6" },
  { question: "What is the powerhouse of the cell?", answer: "mitochondria" },
  { question: "In what country is the Great Barrier Reef located?", answer: "australia" },
  { question: "Who wrote 'Romeo and Juliet'?", answer: "william shakespeare" },
  { question: "What is the speed of light in a vacuum (km/s)?", answer: "300000" },
  { question: "What is the rarest blood type?", answer: "ab negative" },
  { question: "Which animal is known as the 'King of the Jungle'?", answer: "lion" },
  { question: "How many planets are in our solar system?", answer: "8" },
  { question: "What year did the Berlin Wall fall?", answer: "1989" },
  { question: "What is the main ingredient in guacamole?", answer: "avocado" },
  { question: "Which country invented paper?", answer: "china" },
  { question: "How many hearts does an octopus have?", answer: "3" },
  { question: "What is the square root of 144?", answer: "12" },
  { question: "Who discovered penicillin?", answer: "alexander fleming" },
  { question: "What is the tallest mountain in the world?", answer: "mount everest" },
  { question: "What does 'HTTP' stand for?", answer: "hypertext transfer protocol" },
  { question: "In which year did the Titanic sink?", answer: "1912" },
  { question: "What is the boiling point of water in Celsius?", answer: "100" },
  { question: "How many strings does a violin have?", answer: "4" },
  { question: "What is the largest land animal?", answer: "african elephant" },
  { question: "Who was the first man to step on the Moon?", answer: "neil armstrong" },
  { question: "What is the most spoken language in Brazil?", answer: "portuguese" },
  { question: "How many teeth does an adult human typically have?", answer: "32" },
  { question: "Which element has the chemical symbol 'Na'?", answer: "sodium" },
  { question: "What year did the first Harry Potter book release?", answer: "1997" },
  { question: "What is the currency of Japan?", answer: "yen" },
  { question: "How many players are on a soccer team on the field?", answer: "11" },
  { question: "Who was the first woman to fly solo across the Atlantic?", answer: "amelia earhart" },
  { question: "What is the largest desert in the world?", answer: "antarctic desert" },
  { question: "Which US state is known as the 'Sunshine State'?", answer: "florida" },
  { question: "What is the hardest rock?", answer: "diamond" },
  { question: "Who wrote 'The Odyssey'?", answer: "homer" },
  { question: "What is the diameter of Earth (approx, in km)?", answer: "12742" },
  { question: "How many colors are in a rainbow?", answer: "7" },
  { question: "What is the fastest land animal?", answer: "cheetah" },
  { question: "Which planet has the most moons?", answer: "saturn" },
  { question: "In what year did the Internet become publicly available?", answer: "1993" },
  { question: "What is the main language spoken in Egypt?", answer: "arabic" },
  { question: "How many chambers does the human heart have?", answer: "4" },
  { question: "Who directed 'Jurassic Park'?", answer: "steven spielberg" },
  { question: "What is the chemical formula for water?", answer: "h2o" },
  { question: "Which country is home to the kangaroo?", answer: "australia" },
  { question: "What is the smallest prime number?", answer: "2" },
  { question: "How many rings does Saturn have (main groups)?", answer: "7" },
  { question: "Who painted the ceiling of the Sistine Chapel?", answer: "michelangelo" },
  { question: "What is the deepest ocean trench?", answer: "mariana trench" },
  { question: "Which planet is closest in size to Earth?", answer: "venus" },
  { question: "What year was the first iPhone released?", answer: "2007" },
  { question: "How many bits are in a byte?", answer: "8" },
  { question: "What is the largest bird in the world?", answer: "ostrich" },
  { question: "Who wrote '1984'?", answer: "george orwell" },
  { question: "What is the freezing point of water in Fahrenheit?", answer: "32" },
  { question: "Which country is known as the Land of the Rising Sun?", answer: "japan" },
  { question: "How many lives does a cat have (according to myth)?", answer: "9" },
  { question: "What is the tallest animal?", answer: "giraffe" },
  { question: "What does 'DNA' stand for?", answer: "deoxyribonucleic acid" },
  { question: "Which ocean is the Bermuda Triangle in?", answer: "atlantic" },
  { question: "Who invented the telephone?", answer: "alexander graham bell" },
  { question: "What is the most abundant gas in Earth's atmosphere?", answer: "nitrogen" },
  { question: "How many weeks are in a year?", answer: "52" },
  { question: "In what country is Mount Kilimanjaro?", answer: "tanzania" },
  { question: "What is the largest fish in the world?", answer: "whale shark" },
  { question: "Who founded Microsoft?", answer: "bill gates" },
  { question: "What year did the Soviet Union collapse?", answer: "1991" },
  { question: "How many sides does a dodecagon have?", answer: "12" },
  { question: "What is the capital of Canada?", answer: "ottawa" },
  { question: "Which element has the symbol 'Fe'?", answer: "iron" },
  { question: "Who painted 'Starry Night'?", answer: "vincent van gogh" },
  { question: "What is the speed of sound in air (approx, in m/s)?", answer: "343" },
  { question: "Which animal can change its color for camouflage?", answer: "chameleon" },
  { question: "How many Grand Slam tennis tournaments are there?", answer: "4" },
  { question: "What is the capital of South Korea?", answer: "seoul" },
  { question: "Who is the Greek god of the sea?", answer: "poseidon" },
  { question: "What is the main ingredient in chocolate?", answer: "cocoa" },
  { question: "How many years are in a millennium?", answer: "1000" },
  { question: "Which country has the largest population?", answer: "india" },
  { question: "What is the smallest country in the world?", answer: "vatican city" },
  { question: "Who was the first President of the United States?", answer: "george washington" },
  { question: "What is the most spoken language in the world by total speakers?", answer: "english" },
  { question: "How many degrees are in a circle?", answer: "360" },
  { question: "What is the national flower of Japan?", answer: "cherry blossom" },
  { question: "Who discovered gravity?", answer: "isaac newton" },
  { question: "What is the capital of Australia?", answer: "canberra" },
  { question: "What does 'USB' stand for?", answer: "universal serial bus" },
  { question: "How many time zones are there in the world?", answer: "24" },
  { question: "What is the hardest part of the human body?", answer: "enamel" },
  { question: "Who was the first woman in space?", answer: "valentina tereshkova" },
  { question: "What is the tallest building in the world (2024)?", answer: "burj khalifa" },
  { question: "Which animal is the symbol of the World Wildlife Fund?", answer: "panda" },
  { question: "How many hours are in a day on Mars (approx)?", answer: "24.6" },
  { question: "What is the most widely consumed manufactured drink?", answer: "tea" },
  { question: "Who painted 'The Scream'?", answer: "edvard munch" },
  { question: "What is the national sport of Canada?", answer: "lacrosse" },
  { question: "How many stars are on the US flag?", answer: "50" },
  { question: "What does 'Wi-Fi' stand for?", answer: "wireless fidelity" },
  { question: "What is the rarest gemstone?", answer: "painite" },
  { question: "Which country is home to the Great Wall?", answer: "china" },
  { question: "How many bytes are in a megabyte (traditionally)?", answer: "1048576" },
  { question: "What animal has the longest lifespan?", answer: "bowhead whale" },
  { question: "Who wrote 'The Great Gatsby'?", answer: "f. scott fitzgerald" }
];
const scribbleWords = [
  'cat', 'dog', 'house', 'tree', 'car', 'sun', 'moon', 'star', 'fish',
  'bird', 'apple', 'banana', 'boat', 'flower', 'hat', 'pizza', 'robot',
  'snake', 'spider', 'sword', 'umbrella', 'volcano', 'wizard', 'ghost',
  'crown', 'clock', 'book', 'mountain', 'rainbow', 'heart'
];
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms[code] ? generateCode() : code;
}
function findRoomByPlayer(socketId) {
  for (const [code, room] of Object.entries(rooms)) {
    if (room.players[socketId]) return { code, room };
  }
  return null;
}
function getBannedList(code) {
  const room = rooms[code];
  if (!room || !room.kickedNames) return [];
  return Array.from(room.kickedNames).map(name => ({
    name,
    reason: room.kickedReasons[name] || 'No reason given'
  }));
}
function assignPlayerColors(playerIds) {
  const colors = ['#E05D5D', '#5E9B9A', '#F4C542', '#6C8EBF', '#9B7EBD'];
  const shuffled = [...colors].sort(() => Math.random() - 0.5);
  const map = {};
  playerIds.forEach((id, i) => { map[id] = shuffled[i % shuffled.length]; });
  return map;
}
function getPublicRooms() {
  const list = [];
  for (const [code, room] of Object.entries(rooms)) {
    if (room.isListed && !room.gameActive) {
      const hostPlayer = room.players[room.host];
      list.push({
  code,
  roomName: room.roomName,
  hostName: hostPlayer?.name || 'Unknown',
  playerCount: Object.keys(room.players).length,
  maxPlayers: room.maxPlayers || 5,
  currentGame: room.currentGame || 'lobby'
});
    }
  }
  return list;
}
function broadcastRoomList() {
  io.emit('roomList', getPublicRooms());
}
io.on('connection', (socket) => {
  socket.on('webrtc-offer', (data) => {
  io.to(data.to).emit('webrtc-offer', { from: socket.id, offer: data.offer });
});
socket.on('setMaxPlayers', (max) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  const newMax = Math.max(2, Math.min(5, parseInt(max) || 5));
  if (newMax < Object.keys(result.room.players).length) return;
  result.room.maxPlayers = newMax;
  io.to(result.code).emit('roomUpdate', getRoomState(result.code));
});
socket.on('leaveRoom', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result) return;
  const playerName = result.room.players[socket.id]?.name || 'Someone';
  const roomCode = result.code;
  const wasHost = result.room.host === socket.id;
  console.log('LEAVE ROOM - players remaining:', Object.keys(result.room.players).length, 'host was:', wasHost);
  delete result.room.players[socket.id];
  if (wasHost) {
    const remaining = Object.keys(result.room.players);
    if (remaining.length > 0) {
      const newHostId = remaining[0];
      result.room.host = newHostId;
      result.room.players[newHostId].isHost = true;
      io.to(roomCode).emit('chatMessage', {
        system: true,
        text: `${result.room.players[newHostId].name} is now the host.`,
        timestamp: Date.now()
      });
    }
  }
  io.to(roomCode).emit('chatMessage', {
    system: true,
    text: `${playerName} left the room.`,
    timestamp: Date.now()
  });
  io.to(roomCode).emit('roomUpdate', getRoomState(roomCode));
  broadcastRoomList();
  if (Object.keys(result.room.players).length === 0) {
    delete rooms[roomCode];
  }
});
socket.on('requestRoomList', () => {
  socket.emit('roomList', getPublicRooms());
});
socket.on('scribbleStroke', (data) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'scribble') return;
  const game = result.room.gameData;
  if (game.drawer !== socket.id) return;
  game.strokes.push(data);
  game.guessers.forEach(id => io.to(id).emit('scribbleStroke', data));
});
socket.on('scribbleClear', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'scribble') return;
  const game = result.room.gameData;
  if (game.drawer !== socket.id) return;
  game.strokes = [];
  game.guessers.forEach(id => io.to(id).emit('scribbleClear'));
});
socket.on('scribbleGuess', (guess) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'scribble') return;
  const game = result.room.gameData;
  if (!game.guessers.includes(socket.id)) return;
  const msg = {
    senderId: socket.id,
    senderName: result.room.players[socket.id].name,
    text: guess,
    timestamp: Date.now()
  };
  io.to(result.code).emit('scribbleChatMessage', msg);
  if (game.guessedPlayers && game.guessedPlayers.includes(socket.id)) {
    socket.emit('scribbleWrong', { message: 'You already guessed!' });
    return;
  }
  if (guess.trim().toLowerCase().includes(game.word.toLowerCase())) {
    if (!game.guessedPlayers) game.guessedPlayers = [];
    game.guessedPlayers.push(socket.id);
    game.scores[game.drawer] = (game.scores[game.drawer] || 0) + 1;
    game.scores[socket.id] = (game.scores[socket.id] || 0) + 1;
    result.room.players[game.drawer].score = game.scores[game.drawer];
    result.room.players[socket.id].score = game.scores[socket.id];
    const guesserName = result.room.players[socket.id].name;
    io.to(result.code).emit('scribbleCorrect', {
      guesser: socket.id,
      guesserName,
      word: game.word
    });
    io.to(result.code).emit('roomUpdate', getRoomState(result.code));
    if (game.guessedPlayers.length === game.guessers.length) {
      endScribbleRound(result.code, result.room, true);
    }
  } else {
    socket.emit('scribbleWrong');
  }
});
socket.on('scribbleChatMessage', (text) => {
  const result = findRoomByPlayer(socket.id);
  if (!result) return;
  const msg = {
    senderId: socket.id,
    senderName: result.room.players[socket.id].name,
    text,
    timestamp: Date.now()
  };
  io.to(result.code).emit('scribbleChatMessage', msg);
});
socket.on('buzz', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'buzz-battle') return;
  const game = result.room.gameData;
  if (!game || !game.buzzWindowActive) return;
  if (!game.buzzOrder.includes(socket.id)) {
    game.buzzOrder.push(socket.id);
    io.to(result.code).emit('buzzSound');
    io.to(result.code).emit('buzzUpdate', { buzzOrder: game.buzzOrder });
  }
});
socket.on('buzzAnswer', (answer) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'buzz-battle') return;
  handleBuzzAnswer(result.code, result.room, socket.id, answer);
});
socket.on('buzzSkip', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id || result.room.currentGame !== 'buzz-battle') return;
  skipBuzzQuestion(result.code, result.room);
});
socket.on('storyChooseGenre', (genre) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'story-chain') return;
  const game = result.room.gameData;
  if (!game || game.genrePicker !== socket.id) return;
  const genres = ['Fantasy', 'Sci-Fi', 'Horror', 'Comedy', 'Mystery'];
  game.genre = genre === 'Random' ? genres[Math.floor(Math.random() * genres.length)] : genre;
  game.genrePicker = null;
  io.to(result.code).emit('storyGenreChosen', {
  genre: game.genre,
  timer: game.timer,
  turnOrder: game.turnOrder,
  colors: game.playerColors,
  currentTurn: game.turnOrder[game.currentTurnIndex]
});
});
socket.on('storyPassGenre', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'story-chain') return;
  const game = result.room.gameData;
  if (!game || game.genrePicker !== socket.id) return;
  const currentIndex = game.turnOrder.indexOf(socket.id);
  let nextIndex = (currentIndex + 1) % game.turnOrder.length;
  if (game.turnOrder[nextIndex] === game.genrePicker) {
    const genres = ['Fantasy', 'Sci-Fi', 'Horror', 'Comedy', 'Mystery'];
    game.genre = genres[Math.floor(Math.random() * genres.length)];
    game.genrePicker = null;
    io.to(result.code).emit('storyGenreChosen', {
  genre: game.genre,
  timer: game.timer,
  turnOrder: game.turnOrder,
  colors: game.playerColors,
  currentTurn: game.turnOrder[game.currentTurnIndex]
});
    return;
  }
  game.genrePicker = game.turnOrder[nextIndex];
  io.to(game.genrePicker).emit('requestGenrePick');
  socket.emit('genrePassed');
});
function endVote(code) {
  const room = rooms[code];
  if (!room || !room.voteState || !room.voteState.active) return;
  clearTimeout(room.voteState.timeoutId);
  room.voteState.active = false;
  const voteCounts = {};
  for (const [, gameId] of Object.entries(room.voteState.votes)) {
    voteCounts[gameId] = (voteCounts[gameId] || 0) + 1;
  }
  let maxVotes = 0;
  let winners = [];
  for (const [gameId, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) { maxVotes = count; winners = [gameId]; }
    else if (count === maxVotes) { winners.push(gameId); }
  }
  const winningGame = winners.length > 0 ? winners[0] : null;
  io.to(code).emit('voteResult', { winningGame, voteCounts });
  delete room.voteState;
  if (winningGame) {
    room.gameActive = true;
    room.currentGame = winningGame;
    if (winningGame === 'search-engine') {
      const playerIds = Object.keys(room.players);
      const shuffled = playerIds.sort(() => Math.random() - 0.5);
      const engineId = shuffled[0];
      const searcherId = shuffled[1];
      room.gameData = { engine: engineId, searcher: searcherId, engineName: null };
      io.to(code).emit('gameStart', { gameId: winningGame });
      io.to(engineId).emit('roleAssignment', { role: 'engine' });
      io.to(searcherId).emit('roleAssignment', { role: 'searcher' });
      playerIds.forEach(id => {
        if (id !== engineId && id !== searcherId) io.to(id).emit('roleAssignment', { role: 'spectator' });
      });
    } else {
      io.to(code).emit('gameStart', { gameId: winningGame });
    }
  }
}
socket.on('startVote', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  const playerCount = Object.keys(result.room.players).length;
  if (playerCount < 3) {
    socket.emit('chatMessage', { system: true, text: 'Need at least 3 players to start a vote.', timestamp: Date.now() });
    return;
  }
  if (result.room.voteState?.active) return;
  result.room.voteState = {
    active: true,
    votes: {},
    startedBy: socket.id,
    timeoutId: setTimeout(() => endVote(result.code), 30000)
  };
  io.to(result.code).emit('voteStarted', {
    games: ['search-engine', 'impostor', 'best-answer', 'buzz-battle', 'story-chain']
  });
});
socket.on('castVote', (gameId) => {
  const result = findRoomByPlayer(socket.id);
  if (!result) return;
  const room = result.room;
  if (!room.voteState?.active) return;
  if (socket.id === room.host) return;
  if (!['search-engine','impostor','best-answer','buzz-battle','story-chain'].includes(gameId)) return;
  room.voteState.votes[socket.id] = gameId;
  io.to(result.code).emit('voteUpdate', { votes: room.voteState.votes });
});
socket.on('endVote', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  endVote(result.code);
});
socket.on('requestGame', (gameId) => {
  const result = findRoomByPlayer(socket.id);
  if (!result) return;
  const hostId = result.room.host;
  if (hostId === socket.id) return;
  const gameNames = {
    'search-engine': 'Human Search Engine',
    'impostor': 'Impostor in the Chat',
    'best-answer': 'Best Answer Wins',
    'buzz-battle': 'Buzz Battle',
    'story-chain': 'Story Chain'
  };
  io.to(hostId).emit('gameRequested', {
    playerName: result.room.players[socket.id].name,
    gameName: gameNames[gameId] || gameId
  });
});
socket.on('typingStart', () => {
  const result = findRoomByPlayer(socket.id);
  if (result) {
    socket.to(result.code).emit('userTyping', { socketId: socket.id, name: result.room.players[socket.id].name });
  }
});
socket.on('typingStop', () => {
  const result = findRoomByPlayer(socket.id);
  if (result) {
    socket.to(result.code).emit('userStoppedTyping', { socketId: socket.id });
  }
});
socket.on('clearMessages', (targetId) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  const target = result.room.players[targetId];
  if (!target || targetId === socket.id) return;
  io.to(result.code).emit('clearPlayerChat', targetId);
  io.to(result.code).emit('chatMessage', {
    system: true,
    text: `${target.name}'s messages were cleared by the host.`,
    timestamp: Date.now()
  });
});
socket.on('warnPlayer', (data) => {
  const { targetId, reason } = data;
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  const target = result.room.players[targetId];
  if (!target || targetId === socket.id) return;
  io.to(targetId).emit('warned', { reason });
  socket.emit('chatMessage', {
    system: true,
    text: `You warned ${target.name}: "${reason}"`,
    timestamp: Date.now()
  });
});
socket.on('webrtc-answer', (data) => {
  io.to(data.to).emit('webrtc-answer', { from: socket.id, answer: data.answer });
});
socket.on('webrtc-ice-candidate', (data) => {
  io.to(data.to).emit('webrtc-ice-candidate', { from: socket.id, candidate: data.candidate });
});
  socket.on('changeName', (newName) => {
    const result = findRoomByPlayer(socket.id);
    if (!result || !newName.trim()) return;
    const oldName = result.room.players[socket.id].name;
    const trimmed = newName.trim().substring(0, 20);
    if (trimmed === oldName) return;
    result.room.players[socket.id].name = trimmed;
    io.to(result.code).emit('chatMessage', {
      system: true,
      text: `${oldName} changed their name to ${trimmed}.`,
      timestamp: Date.now()
    });
    io.to(result.code).emit('roomUpdate', getRoomState(result.code));
  });
  socket.on('createRoom', (data, callback) => {
  const playerName = (typeof data === 'string' ? data : data.playerName)?.trim();
let roomName = (typeof data === 'string' ? `${playerName}'s Room` : (data.roomName?.trim() || `${playerName}'s Room`));
if (!roomName || !roomName.trim()) roomName = `${playerName}'s Room`;
  const code = generateCode();
  const hostToken = Math.random().toString(36).substring(2, 15);
  rooms[code] = {
    host: socket.id,
    hostToken,
    gameActive: false,
    currentGame: null,
    roomName,
    maxPlayers: 5,
    isListed: true,
    mutedNames: new Set(),
    kickedNames: new Set(),
    kickedReasons: {},
    players: {
      [socket.id]: { name: playerName || 'Host', isHost: true, score: 0, muted: false }
    }
  };
  socket.join(code);
  socket.data.roomCode = code;
  socket.data.playerName = playerName;
  callback({ success: true, code, hostToken });
  broadcastRoomList();
  io.to(code).emit('roomUpdate', getRoomState(code));
});
  socket.on('joinRoom', (code, playerName, callback) => {
    code = code.toUpperCase();
    const room = rooms[code];
    if (!room) return callback({ success: false, error: 'Room not found' });
    if (room.gameActive) return callback({ success: false, error: 'Game already in progress' });
    if (Object.keys(room.players).length >= (room.maxPlayers || 5)) {
  return callback({ success: false, error: `Room is full (max ${room.maxPlayers || 5})` });
}
    room.players[socket.id] = {
  name: playerName,
  isHost: false,
  score: 0,
  muted: room.mutedNames ? room.mutedNames.has(playerName) : false
};
if (room.kickedNames && room.kickedNames.has(playerName)) {
  return callback({ success: false, error: 'kicked', reason: room.kickedReasons[playerName] || 'No reason given' });
}
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerName = playerName;
    callback({ success: true, code });
    broadcastRoomList();
    io.to(code).emit('roomUpdate', getRoomState(code));
    io.to(code).emit('chatMessage', { system: true, text: `${playerName} joined the room!`, timestamp: Date.now() });
  });
  socket.on('rejoinHost', (code, token, playerName, callback) => {
  code = code.toUpperCase();
  const room = rooms[code];
  if (!room) return callback({ success: false, error: 'Room not found' });
  if (room.hostToken !== token) return callback({ success: false, error: 'Invalid host token' });
  if (room._hostTimeout) {
    clearTimeout(room._hostTimeout);
    room._hostTimeout = null;
  }
  if (room.host !== socket.id) {
    const currentHost = room.players[room.host];
    if (currentHost) {
      currentHost.isHost = false;
      io.to(code).emit('chatMessage', {
        system: true,
        text: `${currentHost.name} is no longer the host.`,
        timestamp: Date.now()
      });
    }
  }
  const oldMuted = room.players[socket.id]?.muted || (room.mutedNames ? room.mutedNames.has(playerName) : false);
  delete room.players[socket.id];
  room.host = socket.id;
  room.players[socket.id] = { name: playerName || 'Host', isHost: true, score: 0, muted: oldMuted };
  socket.join(code);
  socket.data.roomCode = code;
  socket.data.playerName = playerName || 'Host';
  callback({ success: true, code });
  io.to(code).emit('roomUpdate', getRoomState(code));
  io.to(code).emit('chatMessage', { system: true, text: `${playerName} is back as host.`, timestamp: Date.now() });
});
  socket.on('chatMessage', (text) => {
  const result = findRoomByPlayer(socket.id);
  if (!result) return;
  if (result.room.players[socket.id].muted) return;
  const msg = { senderId: socket.id, senderName: result.room.players[socket.id].name, text, timestamp: Date.now() };
  io.to(result.code).emit('chatMessage', msg);
});
    socket.on('selectGame', (gameId, settings) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  result.room.gameActive = true;
  result.room.currentGame = gameId;
  if (gameId === 'search-engine') {
    const playerIds = Object.keys(result.room.players);
    if (playerIds.length < 2) {
      result.room.gameActive = false;
      result.room.currentGame = null;
      socket.emit('chatMessage', { system: true, text: 'Need at least 2 players for Human Search Engine.', timestamp: Date.now() });
      return;
    }
    const shuffled = playerIds.sort(() => Math.random() - 0.5);
    const engineId = shuffled[0];
    const searcherId = shuffled[1];
    result.room.gameData = { engine: engineId, searcher: searcherId, engineName: null };
    io.to(result.code).emit('gameStart', { gameId });
    io.to(engineId).emit('roleAssignment', { role: 'engine' });
    io.to(searcherId).emit('roleAssignment', { role: 'searcher' });
    playerIds.forEach(id => {
      if (id !== engineId && id !== searcherId) io.to(id).emit('roleAssignment', { role: 'spectator' });
    });
  } else if (gameId === 'story-chain') {
    const playerIds = Object.keys(result.room.players);
    if (playerIds.length < 2) {
      result.room.gameActive = false;
      result.room.currentGame = null;
      socket.emit('chatMessage', { system: true, text: 'Need at least 2 players for Story Chain.', timestamp: Date.now() });
      return;
    }
    const shuffled = playerIds.sort(() => Math.random() - 0.5);
    const genres = ['Fantasy', 'Sci-Fi', 'Horror', 'Comedy', 'Mystery'];
    const initialGenre = settings?.genre || null;
    const timer = settings?.timer || 60;
    result.room.gameData = {
      genre: initialGenre || genres[Math.floor(Math.random() * genres.length)],
      timer,
      turnOrder: shuffled,
      currentTurnIndex: 0,
      storyLines: [],
      active: true,
      genrePicker: initialGenre ? null : socket.id,
      playerColors: assignPlayerColors(shuffled)
    };
    io.to(result.code).emit('gameStart', { gameId });
    if (!initialGenre) {
      io.to(socket.id).emit('requestGenrePick');
    } else {
  const playerColors = result.room.gameData.playerColors;
  io.to(result.code).emit('storyGenreChosen', {
    genre: initialGenre,
    timer,
    turnOrder: shuffled,
    colors: playerColors,
    currentTurn: shuffled[0]
  });
}
  } else if (gameId === 'buzz-battle') {
    const playerIds = Object.keys(result.room.players);
    if (playerIds.length < 2) {
      result.room.gameActive = false;
      result.room.currentGame = null;
      socket.emit('chatMessage', { system: true, text: 'Need at least 2 players for Buzz Battle.', timestamp: Date.now() });
      return;
    }
    result.room.gameData = {
      questions: [...buzzQuestions],
      currentQuestionIndex: 0,
      buzzOrder: [],
      currentAnswerer: null,
      buzzWindowActive: false,
      answerWindowActive: false,
      questionTimeout: null,
      answerTimeout: null,
      scores: {}
    };
    playerIds.forEach(id => { result.room.gameData.scores[id] = 0; });
    io.to(result.code).emit('gameStart', { gameId });
    setTimeout(() => startBuzzQuestion(result.code, result.room), 1500);
  } else if (gameId === 'scribble') {
    const playerIds = Object.keys(result.room.players);
    if (playerIds.length < 2) {
      result.room.gameActive = false;
      result.room.currentGame = null;
      socket.emit('chatMessage', { system: true, text: 'Need at least 2 players for Scribble.', timestamp: Date.now() });
      return;
    }
    const shuffled = playerIds.sort(() => Math.random() - 0.5);
    const drawer = shuffled[0];
    const guessers = shuffled.slice(1);
    const word = scribbleWords[Math.floor(Math.random() * scribbleWords.length)];
    const scores = {};
    playerIds.forEach(id => { scores[id] = 0; });
    result.room.gameData = {
  drawer, guessers, word,
  round: 1,
  scores,
  timer: null,
  strokes: [],
  guessedPlayers: []
};
    io.to(result.code).emit('gameStart', { gameId });
    io.to(drawer).emit('roleAssignment', { role: 'drawer', word });
    guessers.forEach(id => io.to(id).emit('roleAssignment', { role: 'guesser' }));
    startScribbleRound(result.code, result.room);
  } else {
    io.to(result.code).emit('gameStart', { gameId });
  }
});
socket.on('storySubmitLine', (text) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'story-chain') return;
  const game = result.room.gameData;
  if (!game || !game.active) return;
  const turnOrder = game.turnOrder;
  const currentId = turnOrder[game.currentTurnIndex];
  if (socket.id !== currentId) return;
  const line = text.trim().substring(0, 200);
  if (!line) return;
  game.storyLines.push({
    playerId: socket.id,
    playerName: result.room.players[socket.id].name,
    text: line
  });
  game.currentTurnIndex++;
  if (game.currentTurnIndex >= turnOrder.length) {
    game.currentTurnIndex = 0;
  }
  const nextId = turnOrder[game.currentTurnIndex];
  io.to(result.code).emit('storyUpdate', { lines: game.storyLines, currentTurn: nextId, colors: game.playerColors });
  turnOrder.forEach(id => {
    io.to(id).emit('roleAssignment', { role: id === nextId ? 'writer' : 'waiting', genre: game.genre, timer: game.timer, turnOrder: game.turnOrder, colors: game.playerColors, currentTurn: nextId });
  });
});
socket.on('storyEndGame', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'story-chain') return;
  const game = result.room.gameData;
  if (!game) return;
  const isHost = result.room.host === socket.id;
  const currentWriter = game.turnOrder[game.currentTurnIndex];
  if (!isHost && socket.id !== currentWriter) return;
  game.active = false;
  io.to(result.code).emit('storyEnded', { lines: game.storyLines, genre: game.genre });
  setTimeout(() => {
    const enderName = result.room.players[socket.id]?.name || 'Someone';
    result.room.gameActive = false;
    result.room.currentGame = null;
    result.room.gameData = null;
    for (const player of Object.values(result.room.players)) player.score = 0;
    io.to(result.code).emit('gameEnded', { name: enderName });
    io.to(result.code).emit('backToLobby');
    io.to(result.code).emit('roomUpdate', getRoomState(result.code));
        broadcastRoomList();
  }, 5000);
});
  socket.on('searchQuery', (query) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'search-engine') return;
  const game = result.room.gameData;
  if (!game || game.searcher !== socket.id) return;
  io.to(game.engine).emit('incomingQuery', { query, from: result.room.players[socket.id].name });
  socket.emit('querySent', { query });
  io.to(result.code).emit('newQuery', { from: result.room.players[socket.id].name, query });
});
socket.on('engineTyping', (text) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'search-engine') return;
  const game = result.room.gameData;
  if (!game || game.engine !== socket.id) return;
  io.to(game.searcher).emit('engineResponse', { text });
  socket.to(result.code).emit('engineLiveResponse', { text });
});
socket.on('engineDone', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'search-engine') return;
  const game = result.room.gameData;
  if (!game || game.engine !== socket.id) return;
  io.to(game.searcher).emit('answerComplete');
  io.to(result.code).emit('answerComplete', { engineName: game.engineName || result.room.players[socket.id].name });
});
socket.on('setEngineName', (name) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'search-engine') return;
  const game = result.room.gameData;
  if (!game || game.engine !== socket.id) return;
  game.engineName = name;
  io.to(result.code).emit('engineNameSet', { name });
});
socket.on('switchRoles', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.currentGame !== 'search-engine') return;
  const game = result.room.gameData;
  if (!game) return;
  if (socket.id !== game.engine && socket.id !== game.searcher && result.room.host !== socket.id) return;
  const temp = game.engine;
  game.engine = game.searcher;
  game.searcher = temp;
  io.to(result.code).emit('rolesSwapped', { engine: game.engine, searcher: game.searcher });
  io.to(game.engine).emit('roleAssignment', { role: 'engine', engineName: game.engineName || null });
  io.to(game.searcher).emit('roleAssignment', { role: 'searcher' });
  io.to(result.code).emit('chatMessage', {
    system: true,
    text: 'Roles have been swapped.',
    timestamp: Date.now()
  });
});
  socket.on('backToLobby', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result) return;
  const isHost = result.room.host === socket.id;
  const game = result.room.gameData;
  const isActivePlayer = game && (socket.id === game.engine || socket.id === game.searcher);
  if (!isHost && !isActivePlayer) return;
    const enderName = result.room.players[socket.id]?.name || 'Someone';
    result.room.gameActive = false;
    result.room.currentGame = null;
    result.room.gameData = null;
    for (const player of Object.values(result.room.players)) player.score = 0;
    io.to(result.code).emit('gameEnded', { name: enderName });
    io.to(result.code).emit('backToLobby');
    io.to(result.code).emit('roomUpdate', getRoomState(result.code));
  });
  socket.on('disconnect', () => {
    const result = findRoomByPlayer(socket.id);
    if (!result) return;
    const playerName = result.room.players[socket.id]?.name || 'Someone';
    const wasHost = result.room.host === socket.id;
    console.log('DISCONNECT - players remaining:', Object.keys(result.room.players).length, 'host was:', wasHost);
    const roomCode = result.code;
    delete result.room.players[socket.id];
    if (wasHost) {
  const remaining = Object.keys(result.room.players);
  if (remaining.length > 0) {
    const newHostId = remaining[0];
    result.room.host = newHostId;
    result.room.players[newHostId].isHost = true;
    io.to(roomCode).emit('chatMessage', {
      system: true,
      text: `${result.room.players[newHostId].name} is now the host.`,
      timestamp: Date.now()
    });
  }
  const timeoutHandle = setTimeout(() => {
    const room = rooms[roomCode];
    if (!room) return;
    if (Object.keys(room.players).length === 0) {
      delete rooms[roomCode];
    }
    room._hostTimeout = null;
  }, 60000);
  result.room._hostTimeout = timeoutHandle;
}
    io.to(roomCode).emit('chatMessage', {
      system: true,
      text: `${playerName} left the room.`,
      timestamp: Date.now()
    });
    io.to(roomCode).emit('roomUpdate', getRoomState(roomCode));
        broadcastRoomList();
  });
  socket.on('speaking', (data) => {
  const result = findRoomByPlayer(socket.id);
  if (result) {
    socket.to(result.code).emit('speaking', { socketId: socket.id, volume: data.volume });
  }
});
socket.on('kickPlayer', (data) => {
  const { targetId, reason } = data;
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  const target = result.room.players[targetId];
  if (!target || targetId === socket.id) return;
  const targetName = target.name;
  if (!result.room.kickedNames) result.room.kickedNames = new Set();
  result.room.kickedNames.add(targetName);
result.room.kickedReasons[targetName] = reason || 'No reason given';
  delete result.room.players[targetId];
  io.to(targetId).emit('kicked', { reason: reason || 'No reason given' });
  io.to(result.code).emit('chatMessage', {
    system: true,
    text: `${targetName} was kicked from the room.`,
    timestamp: Date.now()
  });
  io.to(result.code).emit('roomUpdate', getRoomState(result.code));
});
socket.on('togglePrivacy', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  result.room.isListed = !result.room.isListed;
  io.to(result.code).emit('privacyUpdated', { isListed: result.room.isListed });
    broadcastRoomList();
});
socket.on('makeHost', (targetId) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  const target = result.room.players[targetId];
  if (!target || targetId === socket.id) return;
  const oldHostId = result.room.host;
  result.room.players[oldHostId].isHost = false;
  result.room.host = targetId;
  target.isHost = true;
  const newToken = Math.random().toString(36).substring(2, 15);
  result.room.hostToken = newToken;
  io.to(targetId).emit('hostTokenUpdated', newToken);
  io.to(result.code).emit('chatMessage', {
    system: true,
    text: `${target.name} is now the host.`,
    timestamp: Date.now()
  });
  io.to(result.code).emit('roomUpdate', getRoomState(result.code));
});
socket.on('mutePlayer', (targetId) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  const target = result.room.players[targetId];
  if (!target || targetId === socket.id) return;
  target.muted = true;
  if (!result.room.mutedNames) result.room.mutedNames = new Set();
  result.room.mutedNames.add(target.name);
  io.to(result.code).emit('chatMessage', {
    system: true, text: `${target.name} was muted by the host.`, timestamp: Date.now()
  });
  io.to(result.code).emit('roomUpdate', getRoomState(result.code));
});
socket.on('updateScore', (targetId, points) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  if (result.room.players[targetId]) {
    result.room.players[targetId].score = (result.room.players[targetId].score || 0) + points;
    io.to(result.code).emit('roomUpdate', getRoomState(result.code));
  }
});
socket.on('unmutePlayer', (targetId) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  const target = result.room.players[targetId];
  if (!target || targetId === socket.id) return;
  target.muted = false;
  if (result.room.mutedNames) result.room.mutedNames.delete(target.name);
  io.to(result.code).emit('chatMessage', {
    system: true, text: `${target.name} was unmuted by the host.`, timestamp: Date.now()
  });
  io.to(result.code).emit('roomUpdate', getRoomState(result.code));
});
socket.on('requestBannedList', () => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  socket.emit('bannedList', getBannedList(result.code));
});
socket.on('unbanPlayer', (playerName) => {
  const result = findRoomByPlayer(socket.id);
  if (!result || result.room.host !== socket.id) return;
  if (result.room.kickedNames) {
    result.room.kickedNames.delete(playerName);
    delete result.room.kickedReasons[playerName];
  }
  socket.emit('chatMessage', {
    system: true,
    text: `${playerName} has been unbanned.`,
    timestamp: Date.now()
  });
  io.to(result.code).emit('bannedList', getBannedList(result.code));
});
});
function startScribbleRound(code, room) {
  const game = room.gameData;
  if (!game || room.currentGame !== 'scribble') return;
  clearTimeout(game.timer);
  game.timer = setTimeout(() => endScribbleRound(code, room, false), 60000);
}
function endScribbleRound(code, room, correct) {
  const game = room.gameData;
  if (!game) return;
  clearTimeout(game.timer);
  if (!correct) {
    io.to(code).emit('scribbleTimeout', { word: game.word });
  }
  io.to(code).emit('scribbleChatMessage', {
    system: true,
    text: `The word was "${game.word}".`,
    timestamp: Date.now()
  });
  game.round++;
  game.guessedPlayers = [];
  const playerIds = Object.keys(room.players);
  const currentIndex = playerIds.indexOf(game.drawer);
  const nextIndex = (currentIndex + 1) % playerIds.length;
  game.drawer = playerIds[nextIndex];
  game.guessers = playerIds.filter(id => id !== game.drawer);
  game.word = scribbleWords[Math.floor(Math.random() * scribbleWords.length)];
  game.strokes = [];
  io.to(code).emit('scribbleClear');
  io.to(game.drawer).emit('roleAssignment', { role: 'drawer', word: game.word });
  game.guessers.forEach(id => io.to(id).emit('roleAssignment', { role: 'guesser' }));
  setTimeout(() => startScribbleRound(code, room), 2000);
}
function getRoomState(code) {
  const room = rooms[code];
  if (!room) return null;
  return {
    code,
    roomName: room.roomName,
    hostId: room.host,
    gameActive: room.gameActive,
    currentGame: room.currentGame,
    maxPlayers: room.maxPlayers,
    isListed: room.isListed ?? true,
    players: Object.entries(room.players).map(([id, data]) => ({
      id, name: data.name, isHost: data.isHost, score: data.score, muted: data.muted
    }))
  };
}
function startBuzzQuestion(code, room) {
  const game = room.gameData;
  if (!game || room.currentGame !== 'buzz-battle') return;
  if (game.currentQuestionIndex >= game.questions.length) {
    endBuzzGame(code, room);
    return;
  }
  const question = game.questions[game.currentQuestionIndex];
  game.buzzOrder = [];
  game.currentAnswerer = null;
  game.buzzWindowActive = true;
  game.answerWindowActive = false;
  clearTimeout(game.questionTimeout);
  clearTimeout(game.answerTimeout);
  io.to(code).emit('buzzQuestion', {
    question: question.question,
    index: game.currentQuestionIndex + 1,
    total: game.questions.length
  });
  game.questionTimeout = setTimeout(() => {
    endBuzzWindow(code, room);
  }, 8000);
}
function endBuzzWindow(code, room) {
  const game = room.gameData;
  if (!game || !game.buzzWindowActive) return;
  game.buzzWindowActive = false;
  clearTimeout(game.questionTimeout);
  if (game.buzzOrder.length === 0) {
    io.to(code).emit('buzzTimeout', {});
    setTimeout(() => {
      game.currentQuestionIndex++;
      startBuzzQuestion(code, room);
    }, 2000);
  } else {
    game.currentAnswerer = game.buzzOrder[0];
    game.answerWindowActive = true;
    io.to(code).emit('buzzTurn', { playerId: game.currentAnswerer });
    game.answerTimeout = setTimeout(() => {
      handleBuzzAnswer(code, room, game.currentAnswerer, null);
    }, 10000);
  }
}
function handleBuzzAnswer(code, room, playerId, answer) {
  const game = room.gameData;
  if (!game || !game.answerWindowActive || game.currentAnswerer !== playerId) return;
  clearTimeout(game.answerTimeout);
  game.answerWindowActive = false;
  const question = game.questions[game.currentQuestionIndex];
  const isCorrect = answer && answer.trim().toLowerCase() === question.answer.toLowerCase();
  if (isCorrect) {
    game.scores[playerId] = (game.scores[playerId] || 0) + 1;
    io.to(code).emit('buzzResult', { playerId, correct: true, answer: question.answer });
  } else {
    game.scores[playerId] = (game.scores[playerId] || 0) - 1;
    io.to(code).emit('buzzResult', { playerId, correct: false, answer: question.answer });
    game.buzzOrder.shift();
    if (game.buzzOrder.length > 0) {
      game.currentAnswerer = game.buzzOrder[0];
      game.answerWindowActive = true;
      io.to(code).emit('buzzTurn', { playerId: game.currentAnswerer });
      game.answerTimeout = setTimeout(() => {
        handleBuzzAnswer(code, room, game.currentAnswerer, null);
      }, 10000);
      return;
    }
  }
  for (const [id, score] of Object.entries(game.scores)) {
    if (room.players[id]) room.players[id].score = score;
  }
  io.to(code).emit('roomUpdate', getRoomState(code));
  setTimeout(() => {
    game.currentQuestionIndex++;
    startBuzzQuestion(code, room);
  }, 2000);
}
function endBuzzGame(code, room) {
  const game = room.gameData;
  if (!game) return;
  clearTimeout(game.questionTimeout);
  clearTimeout(game.answerTimeout);
  io.to(code).emit('buzzGameOver', { scores: game.scores });
  setTimeout(() => {
    room.gameActive = false;
    room.currentGame = null;
    room.gameData = null;
    for (const player of Object.values(room.players)) player.score = 0;
    io.to(code).emit('gameEnded', { name: 'Buzz Battle' });
    io.to(code).emit('backToLobby');
    io.to(code).emit('roomUpdate', getRoomState(code));
  }, 5000);
}
function skipBuzzQuestion(code, room) {
  const game = room.gameData;
  if (!game || room.currentGame !== 'buzz-battle') return;
  clearTimeout(game.questionTimeout);
  clearTimeout(game.answerTimeout);
  game.buzzWindowActive = false;
  game.answerWindowActive = false;
  io.to(code).emit('buzzSkipped', {});
  game.currentQuestionIndex++;
  startBuzzQuestion(code, room);
}
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {});
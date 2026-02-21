const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// rooms[roomId] = { players: { socketId: { userId, username, avatar, score, total } }, totalQuestions, started }
const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── REST ENDPOINTS ────────────────────────────────────────────────────────────

// Create a room (called by quiz page before battle starts)
app.post('/create-room', (req, res) => {
  const { totalQuestions } = req.body;
  const roomId = generateRoomId();
  rooms[roomId] = { players: {}, totalQuestions: totalQuestions || 10, started: false };
  res.json({ roomId });
});

// Get current room state
app.get('/room/:roomId', (req, res) => {
  const room = rooms[req.params.roomId];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({
    players: Object.values(room.players),
    totalQuestions: room.totalQuestions,
    started: room.started
  });
});

// ─── SOCKET EVENTS ─────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Player joins a battle room
  // Emit from client: socket.emit('join_room', { roomId, userId, username, avatar })
  socket.on('join_room', ({ roomId, userId, username, avatar }) => {
    if (!rooms[roomId]) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    socket.join(roomId);
    socket.data.roomId = roomId;
    rooms[roomId].players[socket.id] = {
      userId,
      username,
      avatar: avatar || '🐼',
      score: 0,
      total: rooms[roomId].totalQuestions
    };
    io.to(roomId).emit('room_update', {
      players: Object.values(rooms[roomId].players),
      totalQuestions: rooms[roomId].totalQuestions
    });
    console.log(`${username} joined room ${roomId}`);
  });

  // ── THIS IS THE KEY EVENT YOUR QUIZ PAGE COLLEAGUE NEEDS TO CALL ──
  // socket.emit('answer_submitted', { roomId, userId, correct: true/false })
  socket.on('answer_submitted', ({ roomId, userId, correct }) => {
    const room = rooms[roomId];
    if (!room) return;

    const playerEntry = Object.entries(room.players).find(([, p]) => p.userId === userId);
    if (!playerEntry) return;

    const [, player] = playerEntry;
    if (correct) player.score = Math.min(player.score + 1, player.total);

    io.to(roomId).emit('progress_update', {
      players: Object.values(room.players),
      totalQuestions: room.totalQuestions
    });

    if (player.score >= player.total) {
      io.to(roomId).emit('battle_finished', {
        winner: player,
        players: Object.values(room.players)
      });
    }
  });

  // Start the battle
  socket.on('start_battle', ({ roomId }) => {
    if (!rooms[roomId]) return;
    rooms[roomId].started = true;
    io.to(roomId).emit('battle_started');
  });

  // Disconnect: remove player, clean empty rooms
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      const player = rooms[roomId].players[socket.id];
      if (player) console.log(`${player.username} disconnected`);
      delete rooms[roomId].players[socket.id];
      if (Object.keys(rooms[roomId].players).length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        io.to(roomId).emit('room_update', {
          players: Object.values(rooms[roomId].players),
          totalQuestions: rooms[roomId].totalQuestions
        });
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

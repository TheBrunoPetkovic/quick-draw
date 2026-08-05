import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(cors());

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

// Create room
app.post('/api/rooms', (req, res) => {
  const code = generateRoomCode();
  rooms.set(code, new Set());
  res.json({ roomCode: code });
});

// Join room
app.post('/api/rooms/join', (req, res) => {
  const { roomCode } = req.body;
  if (!rooms.has(roomCode)) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ success: true });
});

// WebSocket
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomCode = url.searchParams.get('roomCode');
  if (!roomCode || !rooms.has(roomCode)) {
    ws.close(4000, 'Invalid room code');
    return;
  }

  // Add socket to room
  const room = rooms.get(roomCode);
  room.add(ws);
  ws.roomCode = roomCode;

  console.log(`User joined room ${roomCode}`);

  // On message
  ws.on('message', (data) => {
    room.forEach(client => {
      if (client !== ws && client.readyState === 1) {
        client.send(data.toString());
      }
    });
  });

  // On disconnect
  ws.on('close', () => {
    room.delete(ws);
    if (room.size === 0) {
      rooms.delete(roomCode);
      console.log(`Room ${roomCode} deleted (empty)`);
    }
    console.log(`User left room ${roomCode}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
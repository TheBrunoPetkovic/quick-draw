import { useState, useEffect, useRef } from 'react';
import Canvas from './Canvas';  

function App() {
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const connectWs = (code: string) => {
    wsRef.current = new WebSocket(`ws://localhost:3000?roomCode=${code}`);
  };

  const createRoom = async () => {
    const res = await fetch('http://localhost:3000/api/rooms', { method: 'POST' });
    const data = await res.json();
    setCurrentRoom(data.roomCode);
    connectWs(data.roomCode);
  };

  const joinRoom = async () => {
    const res = await fetch('http://localhost:3000/api/rooms/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode }),
    });
    if (res.ok) {
      setCurrentRoom(roomCode);
      connectWs(roomCode);
    } else {
      alert('Room not found');
    }
  };

  if (currentRoom) {
    return <Canvas roomCode={currentRoom} ws={wsRef.current} />;
  }

  return (
    <div>
      <button onClick={createRoom}>Create Room</button>
      <br />
      <input value={roomCode} onChange={e => setRoomCode(e.target.value)} placeholder="Enter room code" />
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}

export default App;
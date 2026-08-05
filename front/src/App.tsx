import { useState, useEffect, useRef } from 'react';
import Canvas from './Canvas';  

function App() {
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const connectWs = (code: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      wsRef.current.close();
    }
    wsRef.current = new WebSocket(`ws://localhost:3000?roomCode=${code}`);
  };

  const createRoom = async () => {
    const res = await fetch('http://localhost:3000/api/rooms', { method: 'POST' });
    const data = await res.json();
    setCurrentRoom(data.roomCode);
    setRoomCode(data.roomCode);
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

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {!currentRoom ? (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 24 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={createRoom}>Kreiraj sobu</button>
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Unesi kod sobe"
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
            />
            <button onClick={joinRoom}>Uđi u sobu</button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'rgba(255,255,255,0.95)', padding: '8px 12px', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <strong>Room: {currentRoom}</strong>
            <button onClick={() => navigator.clipboard.writeText(currentRoom)} style={{ marginLeft: 8 }}>
              Kopiraj
            </button>
          </div>
          <div style={{ position: 'absolute', inset: 0 }}>
            <Canvas roomCode={currentRoom} ws={wsRef.current} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
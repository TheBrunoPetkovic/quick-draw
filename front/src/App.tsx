import { useState } from 'react';

function App() {
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');

  const createRoom = async () => {
    const res = await fetch('http://localhost:3000/api/rooms', { method: 'POST' });
    const data = await res.json();
    setCurrentRoom(data.roomCode);
  };

  const joinRoom = async () => {
    const res = await fetch('http://localhost:3000/api/rooms/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode }),
    });
    if (res.ok) setCurrentRoom(roomCode);
    else alert('Room not found');
  };

  if (currentRoom) {
    return <h1>In room: {currentRoom}</h1>;
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
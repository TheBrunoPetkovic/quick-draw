import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useRef, useEffect, useState } from 'react';

interface Props {
  roomCode: string;
  ws: WebSocket | null;
}

export default function Canvas({ roomCode, ws }: Props) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!ws) return;
    ws.onopen = () => setConnected(true);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'draw') {
        canvasRef.current?.loadPaths(data.paths);
      }
    };
  }, [ws]);

  const handleStroke = async () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const paths = await canvasRef.current?.exportPaths();
    ws.send(JSON.stringify({ type: 'draw', paths, roomCode }));
  };

  return (
    <div>
      <h2>Room: {roomCode} {connected ? '🟢' : '🔴'}</h2>
      <ReactSketchCanvas
        ref={canvasRef}
        style={{ border: '1px solid black', width: '100%', height: '500px' }}
        strokeWidth={4}
        strokeColor="black"
        onStroke={handleStroke}
      />
    </div>
  );
}
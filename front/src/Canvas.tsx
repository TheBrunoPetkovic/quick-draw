import { Tldraw } from '@tldraw/tldraw';
// @ts-ignore - CSS import type declarations are not available in this environment
import '@tldraw/tldraw/tldraw.css';
import { useEffect, useRef, useCallback } from 'react';

interface Props {
  roomCode: string;
  ws: WebSocket | null;
}

export default function Canvas({ roomCode, ws }: Props) {
  const editorRef = useRef<any>(null);
  const lastSentRef = useRef<string>('');

  const handleMount = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'draw' && editorRef.current) {
        editorRef.current.loadSnapshot(data.snapshot);
      }
    };
  }, [ws]);

  useEffect(() => {
    if (!ws || !editorRef.current) return;

    const unsubscribe = editorRef.current.store.listen((entry: any) => {
      if (entry.changes?.added?.size > 0 || entry.changes?.updated?.size > 0) {
        const snapshot = editorRef.current.getSnapshot();
        const serialized = JSON.stringify(snapshot);
        if (serialized !== lastSentRef.current) {
          lastSentRef.current = serialized;
          ws.send(JSON.stringify({ type: 'draw', snapshot, roomCode }));
        }
      }
    });

    return () => unsubscribe();
  }, [ws, roomCode]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tldraw onMount={handleMount} persistenceKey={roomCode} />
    </div>
  );
}
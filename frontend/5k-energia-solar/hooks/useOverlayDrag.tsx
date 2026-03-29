import { useEffect, useRef } from 'react';

type MoveHandler = (clientX: number, clientY: number) => void;
type EndHandler = () => void;

interface DragRef {
  dragging: boolean;
  offsetX: number;
  offsetY: number;
}

export default function useOverlayDrag(onMove: MoveHandler, onEnd?: EndHandler) {
  const draggingRef = useRef<DragRef | null>(null);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      if (!draggingRef.current.dragging) return;
      onMove(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      if (draggingRef.current) {
        draggingRef.current.dragging = false;
        if (onEnd) onEnd();
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onMove, onEnd]);

  const start = (initialX: number, initialY: number, offsetX: number, offsetY: number) => {
    draggingRef.current = { dragging: true, offsetX, offsetY };
  };

  return { start, draggingRef };
}

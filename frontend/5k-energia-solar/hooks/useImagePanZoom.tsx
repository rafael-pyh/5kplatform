import { useEffect, useRef } from 'react';

type MoveHandler = (dx: number, dy: number) => void;

interface ImageDragRef {
  dragging: boolean;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
}

export default function useImagePanZoom(onMove: MoveHandler) {
  const imageDragRef = useRef<ImageDragRef | null>(null);

  useEffect(() => {
    const handleImagePointerMove = (e: PointerEvent) => {
      if (!imageDragRef.current || !imageDragRef.current.dragging) return;
      const deltaX = e.clientX - imageDragRef.current.startX;
      const deltaY = e.clientY - imageDragRef.current.startY;
      onMove(deltaX, deltaY);
    };

    const handleImagePointerUp = () => {
      if (imageDragRef.current) imageDragRef.current.dragging = false;
    };

    window.addEventListener('pointermove', handleImagePointerMove);
    window.addEventListener('pointerup', handleImagePointerUp);
    return () => {
      window.removeEventListener('pointermove', handleImagePointerMove);
      window.removeEventListener('pointerup', handleImagePointerUp);
    };
  }, [onMove]);

  const start = (startX: number, startY: number, startPanX: number, startPanY: number) => {
    imageDragRef.current = { dragging: true, startX, startY, startPanX, startPanY };
  };

  return { start, imageDragRef };
}

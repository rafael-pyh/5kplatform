'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import SliderControl from '@/components/SliderControl';
import { Button } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

interface QRPositioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (position: { boxCenterXRatio: number; boxCenterYRatio: number; boxSizeRatio: number }) => void;
  imageUrl: string;
  creativeId?: string;
}

export default function QRPositioningModal({
  isOpen,
  onClose,
  onSave,
  imageUrl,
  creativeId,
}: QRPositioningModalProps) {
  const [overlayCenter, setOverlayCenter] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [overlaySizePercent, setOverlaySizePercent] = useState<number>(20);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [overlaySize, setOverlaySize] = useState<number>(140);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync overlay position with center ratios
  useEffect(() => {
    if (previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const sizePx = Math.round(rect.width * (overlaySizePercent / 100));
      setOverlaySize(sizePx);
      const left = Math.round(rect.width * overlayCenter.x - sizePx / 2);
      const top = Math.round(rect.height * overlayCenter.y - sizePx / 2);
      setOverlayPos({
        x: Math.max(0, Math.min(left, rect.width - sizePx)),
        y: Math.max(0, Math.min(top, rect.height - sizePx)),
      });
    }
  }, [overlayCenter, overlaySizePercent]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    
    // Calcular a posição do mouse dentro do container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({
      x: mouseX - overlayPos.x,
      y: mouseY - overlayPos.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    
    // Posição do mouse dentro do container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newX = mouseX - dragStart.x;
    const newY = mouseY - dragStart.y;
    const sizePx = overlaySize;

    // Constrain to container bounds
    const constrainedX = Math.max(0, Math.min(newX, rect.width - sizePx));
    const constrainedY = Math.max(0, Math.min(newY, rect.height - sizePx));

    // Update center based on new position
    const newCenterX = (constrainedX + sizePx / 2) / rect.width;
    const newCenterY = (constrainedY + sizePx / 2) / rect.height;

    setOverlayCenter({
      x: Math.max(0, Math.min(newCenterX, 1)),
      y: Math.max(0, Math.min(newCenterY, 1)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    if (!creativeId) {
      toast.error('ID do criativo não fornecido');
      return;
    }

    try {
      setSaving(true);
      const positionData = {
        boxCenterXRatio: overlayCenter.x,
        boxCenterYRatio: overlayCenter.y,
        boxSizeRatio: overlaySizePercent / 100,
      };
      console.log('[QRPositioningModal] Saving position:', positionData);
      onSave(positionData);
    } catch (error) {
      console.error('Erro ao salvar posição:', error);
      toast.error('Erro ao salvar posição');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mt-1">
                Defina onde o QR code será posicionado neste criativo
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-1 space-y-6">
          {/* Preview */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Preview do Criativo</label>
            <div
              ref={previewRef}
              className="relative w-full bg-gray-100 border-2 border-gray-200 rounded-lg overflow-hidden cursor-move select-none"
              style={{ minHeight: '400px' }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={imageUrl}
                alt="Creative preview"
                className="w-full h-full object-contain pointer-events-none absolute inset-0"
              />

              {/* QR Code Overlay - Draggable */}
              <div
                ref={overlayRef}
                className="absolute bg-blue-400 border-2 border-blue-600 rounded-lg flex items-center justify-center transition-shadow hover:shadow-lg"
                style={{
                  left: `${overlayPos.x}px`,
                  top: `${overlayPos.y}px`,
                  width: `${overlaySize}px`,
                  height: `${overlaySize}px`,
                  opacity: 0.7,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                }}
                onMouseDown={handleMouseDown}
              >
                <div className="text-white text-center text-xs font-bold pointer-events-none">QR</div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              💡 Dica: Arraste a caixa azul para posicionar o QR code, ou use os controles abaixo
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Ajustar Posição</h3>
            <SliderControl
              label="Posição X"
              min={0}
              max={100}
              step={0.3}
              value={Math.round(overlayCenter.x * 100)}
              onChange={(v) => setOverlayCenter((c) => ({ ...c, x: v / 100 }))}
              display={`${Math.round(overlayCenter.x * 100)}%`}
            />
            <SliderControl
              label="Posição Y"
              min={0}
              max={100}
              step={0.3}
              value={Math.round(overlayCenter.y * 100)}
              onChange={(v) => setOverlayCenter((c) => ({ ...c, y: v / 100 }))}
              display={`${Math.round(overlayCenter.y * 100)}%`}
            />
            <SliderControl
              label="Tamanho"
              min={5}
              max={40}
              step={0.3}
              value={overlaySizePercent}
              onChange={(v) => setOverlaySizePercent(v)}
              display={`${overlaySizePercent}%`}
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Dica:</strong> A posição que você define aqui será usada automaticamente quando vendedores
              usarem este criativo. Cada vendedor verá seu próprio QR code nesta posição.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1"
            disabled={saving}
          >
            Pular
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={saving || !creativeId}
          >
            {saving ? (
              <>
                <span className="inline-block mr-2 animate-spin">⏳</span>
                Salvando...
              </>
            ) : (
              <>
                <Icon icon="bi-check-circle" className="inline-block mr-2 w-4 h-4" />
                Salvar Posição
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

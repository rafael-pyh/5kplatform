'use client';

import React from 'react';

interface PosterPreviewProps {
  previewMode: 'qr' | 'criativos' | 'poster';
  previewRef: React.RefObject<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;
  customPoster: string | null;
  posterPreview: string | null;
  overlayPos: { x: number; y: number };
  overlaySize: number;
  qrCodeBase64: string;
  showQROverlay: boolean;
  onOverlayPointerDown: (e: React.PointerEvent) => void;
  handleImagePointerDown: (e: React.PointerEvent<HTMLImageElement>) => void;
  panPos: { x: number; y: number };
  zoomLevel: number;
  personName?: string;
}

export default function PosterPreview({
  previewMode,
  previewRef,
  overlayRef,
  customPoster,
  posterPreview,
  overlayPos,
  overlaySize,
  qrCodeBase64,
  showQROverlay,
  onOverlayPointerDown,
  handleImagePointerDown,
  panPos,
  zoomLevel,
  personName,
}: PosterPreviewProps) {
  return (
    <div className="relative w-full h-96 flex items-center justify-center bg-gray-50">
      {previewMode === 'qr' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <img src={qrCodeBase64} alt="QR" className="object-contain m-auto" style={{ width: 256, height: 256 }} />
        </div>
      )}

      {previewMode === 'criativos' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {customPoster ? (
            <>
              <img 
                src={customPoster} 
                alt="Criativo selecionado" 
                className="w-full h-full object-contain"
                onError={() => {}}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Selecione um criativo para visualizar</div>
          )}
        </div>
      )}

      {previewMode === 'poster' && (
        <div ref={previewRef} className="relative w-full h-full">
          {customPoster ? (
            <>
              <img 
                src={customPoster} 
                alt="Poster custom" 
                className="w-full h-full object-contain"
                onError={() => {}}
              />
            </>
          ) : posterPreview ? (
            <img src={posterPreview} alt="Preview da placa" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Gerando preview...</div>
          )}

          {(customPoster) && (
            <div
              ref={overlayRef}
              onPointerDown={onOverlayPointerDown}
              style={{
                position: 'absolute',
                left: overlayPos.x,
                top: overlayPos.y,
                width: overlaySize,
                height: overlaySize,
                cursor: 'grab',
                touchAction: 'none',
              }}
            >
              <img src={qrCodeBase64} alt="QR overlay" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

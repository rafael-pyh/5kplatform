'use client';

import React from 'react';

interface PosterPreviewProps {
  previewMode: 'qr' | 'poster' | 'create';
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
}: PosterPreviewProps) {
  return (
    <div className="relative w-full h-96 flex items-center justify-center bg-gray-50">
      {previewMode === 'qr' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <img src={qrCodeBase64} alt="QR" className="object-contain m-auto" style={{ width: 256, height: 256 }} />
        </div>
      )}

      {previewMode === 'poster' && (
        <div ref={previewRef} className="relative w-full h-full">
          {customPoster ? (
            <img src={customPoster} alt="Poster custom" className="w-full h-full object-contain" />
          ) : posterPreview ? (
            <img src={posterPreview} alt="Preview da placa" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Gerando preview...</div>
          )}

          {(posterPreview || customPoster) && (
            <div
              ref={overlayRef}
              style={{
                position: 'absolute',
                left: overlayPos.x,
                top: overlayPos.y,
                width: overlaySize,
                height: overlaySize,
                pointerEvents: 'none',
              }}
            >
              <img src={qrCodeBase64} alt="QR overlay" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
        </div>
      )}

      {previewMode === 'create' && (
        <div ref={previewRef} className="relative w-full h-full overflow-hidden bg-gray-50" style={{ cursor: showQROverlay ? 'grab' : 'default' }}>
          {customPoster ? (
            <img
              src={customPoster}
              alt="Poster custom"
              className="w-full h-full object-contain transition-transform"
              style={{
                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                cursor: showQROverlay ? 'grab' : 'default',
              }}
              onPointerDown={handleImagePointerDown}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Faça upload da sua placa</div>
          )}

          {customPoster && showQROverlay && (
            <div
              ref={overlayRef}
              onPointerDown={onOverlayPointerDown}
              style={{
                position: 'absolute',
                left: overlayPos.x,
                top: overlayPos.y,
                width: overlaySize,
                height: overlaySize,
                touchAction: 'none',
                cursor: 'grab',
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

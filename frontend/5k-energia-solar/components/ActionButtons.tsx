import React from 'react';
import { Button } from './ui';

interface ActionButtonsProps {
  onDownloadQR: () => void;
  onDownloadPoster: () => void;
  onSaveAndDownload?: () => void;
  previewMode: 'qr' | 'criativos' | 'poster';
}

export default function ActionButtons({ onDownloadQR, onDownloadPoster, onSaveAndDownload, previewMode }: ActionButtonsProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex-1 flex gap-3">
        <Button onClick={onDownloadQR} variant="outline-green" className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Baixar QR Code
        </Button>
        {previewMode === 'poster' && (
          <Button onClick={onDownloadPoster} variant="outline-blue" className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4" /></svg>
            Baixar placa
          </Button>
        )}
      </div>
    </div>
  );
}

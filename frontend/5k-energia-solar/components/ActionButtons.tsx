import React from 'react';

interface ActionButtonsProps {
  onDownloadQR: () => void;
  onDownloadPoster: () => void;
  onSaveAndDownload?: () => void;
  previewMode: 'qr' | 'poster' | 'create';
}

export default function ActionButtons({ onDownloadQR, onDownloadPoster, onSaveAndDownload, previewMode }: ActionButtonsProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex-1 flex gap-3">
        <button onClick={onDownloadQR} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Baixar QR Code
        </button>
        {previewMode === 'create' ? (
          <button onClick={onSaveAndDownload} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Salvar e baixar
          </button>
        ) : (
          <button onClick={onDownloadPoster} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4" /></svg>
            Baixar placa
          </button>
        )}
      </div>
    </div>
  );
}

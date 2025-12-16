import React from 'react';

interface ModeSelectorProps {
  previewMode: 'qr' | 'poster' | 'create';
  setPreviewMode: (m: 'qr' | 'poster' | 'create') => void;
}

export default function ModeSelector({ previewMode, setPreviewMode }: ModeSelectorProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <button onClick={() => setPreviewMode('qr')} className={`px-3 py-2 rounded-lg ${previewMode === 'qr' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Visualizar QR</button>
      <button onClick={() => setPreviewMode('poster')} className={`px-3 py-2 rounded-lg ${previewMode === 'poster' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Visualizar Placa</button>
      <button onClick={() => setPreviewMode('create')} className={`px-3 py-2 rounded-lg ${previewMode === 'create' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Criar Placa</button>
    </div>
  );
}

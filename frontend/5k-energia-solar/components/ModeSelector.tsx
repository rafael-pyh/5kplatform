import React from 'react';
import { Button } from './ui';

interface ModeSelectorProps {
  previewMode: 'qr' | 'poster' | 'create';
  setPreviewMode: (m: 'qr' | 'poster' | 'create') => void;
}

export default function ModeSelector({ previewMode, setPreviewMode }: ModeSelectorProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <Button onClick={() => setPreviewMode('qr')} variant={previewMode === 'qr' ? 'success' : 'outline-blue'} className="px-3 py-2 rounded-lg">Visualizar QR</Button>
      <Button onClick={() => setPreviewMode('poster')} variant={previewMode === 'poster' ? 'success' : 'outline-blue'} className="px-3 py-2 rounded-lg">Visualizar Placa</Button>
      <Button onClick={() => setPreviewMode('create')} variant={previewMode === 'create' ? 'success' : 'outline-blue'} className="px-3 py-2 rounded-lg">Criar Placa</Button>
    </div>
  );
}

import React from 'react';
import { Button } from './ui';

interface ModeSelectorProps {
  previewMode: 'qr' | 'criativos' | 'poster';
  setPreviewMode: (m: 'qr' | 'criativos' | 'poster') => void;
  isAdmin?: boolean;
}

export default function ModeSelector({ previewMode, setPreviewMode, isAdmin = false }: ModeSelectorProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <Button onClick={() => setPreviewMode('qr')} variant={previewMode === 'qr' ? 'success' : 'outline-blue'} className="px-3 py-2 rounded-lg">Visualizar QR</Button>
      <Button onClick={() => setPreviewMode('poster')} variant={previewMode === 'poster' ? 'success' : 'outline-blue'} className="px-3 py-2 rounded-lg">Visualizar Criativos</Button>
    </div>
  );
}

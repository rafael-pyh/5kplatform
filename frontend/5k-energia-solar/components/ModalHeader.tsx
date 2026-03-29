import React from 'react';
import { Button } from './ui';

interface ModalHeaderProps {
  personName: string;
  onClose: () => void;
}

export default function ModalHeader({ personName, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="mb-4 text-start">
        <p className="text-sm text-gray-600">Vendedor</p>
        <p className="text-lg font-medium text-gray-900">{personName}</p>
      </div>
      <Button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors" variant="none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>
  );
}

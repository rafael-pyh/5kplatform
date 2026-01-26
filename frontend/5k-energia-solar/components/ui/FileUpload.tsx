'use client';

import React, { useRef } from 'react';
import { Icon } from '@iconify/react';

interface FileUploadProps {
  id: string;
  accept?: string;
  multiple?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  dragText?: string;
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({
  id,
  accept = 'image/*',
  multiple = false,
  onChange,
  label = 'Clique para selecionar arquivos',
  dragText = 'ou arraste arquivos aqui',
  className = '',
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    // Reset the input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="text-center">
          <Icon icon="bi-cloud-arrow-up" className="text-2xl text-gray-400 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-500">{dragText}</p>
        </div>
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

FileUpload.displayName = 'FileUpload';
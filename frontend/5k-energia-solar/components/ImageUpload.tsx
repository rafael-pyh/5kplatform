'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  error?: string;
  required?: boolean;
  accept?: string;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  error,
  required = false,
  accept = 'image/*',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isLoading, setIsLoading] = useState(false);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = document.createElement('img');
        
        img.onload = () => {
          // Criar canvas para redimensionar
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
          }

          // Definir tamanho máximo (mantém proporção)
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          // Calcular novo tamanho mantendo proporção
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          // Redimensionar canvas
          canvas.width = width;
          canvas.height = height;

          // Desenhar imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Converter para base64 com qualidade reduzida
          const quality = 0.7; // 70% de qualidade
          const base64String = canvas.toDataURL('image/jpeg', quality);
          
          resolve(base64String);
        };

        img.onerror = () => {
          reject(new Error('Erro ao carregar imagem'));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (máximo 10MB antes da compressão)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande! Tamanho máximo: 10MB');
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    setIsLoading(true);

    try {
      // Comprimir e redimensionar imagem
      const compressedBase64 = await compressImage(file);
      
      // Calcular tamanho da imagem comprimida
      const sizeInKB = Math.round(compressedBase64.length / 1024);
      console.log(`Imagem comprimida: ${sizeInKB}KB`);
      
      // Validar tamanho final
      if (compressedBase64.length > 2 * 1024 * 1024) {
        alert('A imagem ainda está muito grande após a compressão. Por favor, selecione uma imagem menor.');
        setIsLoading(false);
        return;
      }
      
      setPreview(compressedBase64);
      onChange(compressedBase64);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar imagem');
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="space-y-3">
        {preview ? (
          <div className="relative border-2 border-gray-300 rounded-lg p-4">
            <div className="relative w-full h-48 mb-3">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Trocar imagem
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Remover
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={isLoading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center space-y-2">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isLoading ? 'Comprimindo imagem...' : 'Clique para selecionar uma imagem'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG ou JPEG (máx. 10MB)</p>
                <p className="text-xs text-gray-400 mt-1">A imagem será automaticamente comprimida</p>
              </div>
            </div>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

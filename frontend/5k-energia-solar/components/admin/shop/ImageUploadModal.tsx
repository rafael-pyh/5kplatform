'use client';

import { useState, useRef } from 'react';
import ResponsiveModal from '@/components/ResponsiveModal';

interface ImageUploadModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onUploaded?: () => void;
}

export function ImageUploadModal({
  isOpen,
  title,
  onClose,
  onUpload,
  onUploaded,
}: ImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Apenas imagens (JPEG, PNG, GIF, WebP) são permitidas');
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 10MB permitido');
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Selecione uma imagem');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setPreview(null);
      onUploaded?.(); // Chamar callback opcional
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da imagem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  return (
    <ResponsiveModal isOpen={isOpen} onClose={handleClose} title="">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {/* Título */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">📷 {title}</h2>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Input de arquivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione uma imagem
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-2">
            Máximo 10MB. Formatos: JPEG, PNG, GIF, WebP
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedFile}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '⏳ Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

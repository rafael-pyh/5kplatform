'use client';

import { useState, useRef } from 'react';
import ResponsiveModal from '@/components/ResponsiveModal';
import { toast } from 'react-hot-toast';

interface ImageUploadModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onUpload?: (file: File) => Promise<void>;
  onUploaded?: () => void;
  onFileSelected?: (file: File) => void;
}

export function ImageUploadModal({
  isOpen,
  title,
  onClose,
  onUpload,
  onUploaded,
  onFileSelected,
}: ImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError(null);
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const isAllowedType = allowedTypes.includes(file.type) || file.type === '';

    if (!isAllowedType && file.type !== '') {
      const errorMsg = `Tipo de arquivo não suportado: ${file.type}. Apenas JPEG, PNG, GIF e WebP são permitidos`;
      console.error('[ImageUploadModal] ❌ ERRO DE TIPO:', errorMsg);
      setError(errorMsg);
      setSelectedFile(null);
      setPreview(null);
      setFileInfo(null);
      toast.error(errorMsg);
      return;
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = `Arquivo muito grande. Máximo 10MB permitido. Arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
      console.error('[ImageUploadModal] ❌ ERRO DE TAMANHO:', errorMsg);
      setError(errorMsg);
      setSelectedFile(null);
      setPreview(null);
      setFileInfo(null);
      toast.error(errorMsg);
      return;
    }

    // Arquivo válido
    setError(null);
    setSelectedFile(file);
    setFileInfo(`${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      setPreview(result);
    };
    reader.onerror = (error) => {
      const errorMsg = `Erro ao ler a imagem: ${error}. Tente novamente.`;
      console.error('[ImageUploadModal] ❌ FileReader error:', error);
      setError(errorMsg);
      setSelectedFile(null);
      setPreview(null);
      setFileInfo(null);
      toast.error(errorMsg);
    };
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setFileInfo(`Carregando... ${percentComplete.toFixed(0)}%`);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      const errorMsg = 'Selecione uma imagem para continuar';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (onFileSelected) {
      // Modo seleção: apenas retorna o arquivo
      onFileSelected(selectedFile);
      setSelectedFile(null);
      setPreview(null);
      setFileInfo(null);
      onClose();
      return;
    }

    if (!onUpload) {
      const errorMsg = 'Função de upload não fornecida';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onUpload(selectedFile);
      toast.success('Imagem enviada com sucesso!');
      setSelectedFile(null);
      setPreview(null);
      setFileInfo(null);
      setError(null);
      onUploaded?.(); // Chamar callback opcional
      onClose();
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao fazer upload da imagem';
      console.error('[ImageUploadModal] Erro no upload:', err);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setFileInfo(null);
    onClose();
  };

  return (
    <ResponsiveModal isOpen={isOpen} onClose={handleClose} title="">
      <div className="p-6 w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📷 {title}</h2>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 animate-pulse">
              <p className="text-sm font-bold text-red-700 mb-1">⚠️ ERRO</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Informações do Arquivo */}
          {fileInfo && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 animate-pulse">
              <p className="text-sm font-bold text-green-700">
                ✅ ARQUIVO SELECIONADO
              </p>
              <p className="text-sm text-green-700 mt-1">{fileInfo}</p>
            </div>
          )}

          {/* Preview - Seção Destaque */}
          {preview && (
            <div className="bg-blue-50 border-3 border-blue-400 rounded-lg p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🖼️</span>
                <h3 className="text-lg font-bold text-blue-900">Pré-visualização da Imagem</h3>
              </div>
              
              <div className="relative bg-white border-2 border-blue-300 rounded-lg overflow-hidden shadow-lg max-h-96 flex items-center justify-center">
                <img
                  src={preview}
                  alt="Preview da imagem selecionada"
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '380px' }}
                  onError={(e) => {
                    console.error('[ImageUploadModal] ❌ Erro ao renderizar imagem:', e);
                    setError('Erro ao exibir a pré-visualização. Tente selecionando a imagem novamente.');
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    setFileInfo(null);
                    setError(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors font-bold text-xl shadow-lg hover:scale-110 transform"
                  title="Remover imagem"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-blue-600 text-center font-medium">Clique no X para remover a imagem</p>
            </div>
          )}

          {/* Input de arquivo */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              📁 Selecione uma Imagem
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="block w-full text-sm text-gray-600
                file:mr-4 file:py-3 file:px-5
                file:rounded-lg file:border-2 file:border-blue-500
                file:text-sm file:font-bold
                file:bg-blue-500 file:text-white
                hover:file:bg-blue-600
                disabled:opacity-50
                cursor-pointer
                file:cursor-pointer"
            />
            <p className="text-xs text-gray-600 mt-3 font-medium">
              ℹ️ Máximo 10MB | Formatos: JPEG, PNG, GIF, WebP
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-300">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border-2 border-gray-400 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 text-base"
            >
              ✕ Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className={`flex-1 px-4 py-3 rounded-lg font-bold text-base transition-colors ${
                selectedFile && !isSubmitting
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '⏳ Enviando...' : selectedFile ? '✓ Enviar Imagem' : 'Selecione uma Imagem'}
            </button>
          </div>
        </form>
      </div>
    </ResponsiveModal>
  );
}

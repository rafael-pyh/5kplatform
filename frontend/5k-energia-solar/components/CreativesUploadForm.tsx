'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import QRPositioningModal from './QRPositioningModal';

interface CreativesUploadFormProps {
  onSuccess?: () => void;
}

export default function CreativesUploadForm({ onSuccess }: CreativesUploadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdCreativeId, setCreatedCreativeId] = useState<string | null>(null);
  const [creativeImageUrl, setCreativeImageUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar se é imagem
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('A imagem não pode ser maior que 10MB');
      return;
    }

    setFile(selectedFile);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSaveQRPosition = async (position: {
    boxCenterXRatio: number;
    boxCenterYRatio: number;
    boxSizeRatio: number;
  }) => {
    if (!createdCreativeId) {
      console.error('Creative ID is missing', { createdCreativeId, creativeImageUrl });
      toast.error('ID do criativo não encontrado');
      return;
    }

    try {
      await api.post(`/creatives/${createdCreativeId}/qr-position`, position);
      toast.success('Posição do QR code salva com sucesso!');
      setShowQRModal(false);
      setCreatedCreativeId(null);
      setCreativeImageUrl(null);
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao salvar posição:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erro ao salvar posição do QR code';
      toast.error(errorMsg);
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setCreatedCreativeId(null);
    setCreativeImageUrl(null);
    onSuccess?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Se há um criativo sendo criado (modal aberto), não permitir resubmissão do formulário
    if (showQRModal || createdCreativeId) {
      return;
    }

    if (!file) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Por favor, preencha o nome do criativo');
      return;
    }

    try {
      setIsLoading(true);

      // Primeiro fazer upload da imagem para MinIO
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'criativo');

      const uploadResponse = await api.post<any>('/upload/poster', uploadFormData);

      const imageUrl = uploadResponse.data.data?.url || uploadResponse.data.url;

      if (!imageUrl) {
        throw new Error('Falha ao fazer upload da imagem');
      }

      // Depois criar o criativo na base de dados
      const creativeData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        imageUrl,
        type: 'POSTER',
        tags: formData.tags.trim() || undefined,
      };

      const response = await api.post('/creatives', creativeData);

      toast.success('Criativo criado com sucesso!');

      // Salvar ID do criativo para posicionamento do QR code
      setCreatedCreativeId(response.data.data?.id);
      setCreativeImageUrl(imageUrl);
      
      // Mostrar modal de posicionamento
      setShowQRModal(true);

      // Resetar formulário
      setFormData({
        name: '',
        description: '',
        tags: '',
      });
      setFile(null);
      setPreview(null);
    } catch (error: any) {
      console.error('Erro ao criar criativo:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erro ao criar criativo';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Preview da imagem */}
      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setFile(null);
            }}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-xs text-gray-500 text-center">
              <span className="font-semibold">Clique para enviar</span> ou arraste a imagem
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
      )}

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Criativo *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ex: Placa Solar 2025"
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição (opcional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Descreva o criativo..."
          rows={3}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (opcional)
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="Ex: solar, energia, 2025"
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Botão de envio */}
      <button
        type="submit"
        disabled={isLoading || !file}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Criar Criativo</span>
          </>
        )}
      </button>

      {/* QR Positioning Modal */}
      {createdCreativeId && creativeImageUrl && (
        <QRPositioningModal
          isOpen={showQRModal}
          onClose={handleCloseQRModal}
          onSave={handleSaveQRPosition}
          imageUrl={creativeImageUrl}
          creativeId={createdCreativeId}
        />
      )}
    </form>
  );
}

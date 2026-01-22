'use client';

import { Order, OrderStatus } from '@/lib/types/shop.types';
import { formatDate } from '@/lib/utils/dateUtils';
import { useState } from 'react';
import ResponsiveModal from '../ResponsiveModal';
import { ImageModal } from '../ImageModal';
import { FileUpload } from '../ui';
import { uploadPaymentProof } from '@/app/actions/shop';

interface OrderCardProps {
  order: Order;
  onUploadSuccess?: () => void;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PENDING_APPROVAL]: 'bg-blue-100 text-blue-800',
  [OrderStatus.APPROVED]: 'bg-green-100 text-green-800',
  [OrderStatus.REJECTED]: 'bg-red-100 text-red-800',
  [OrderStatus.PAID]: 'bg-green-100 text-green-800',
};

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'Aguardando Pagamento',
  [OrderStatus.PENDING_APPROVAL]: 'Aguardando Aprovação',
  [OrderStatus.APPROVED]: 'Aprovado',
  [OrderStatus.REJECTED]: 'Rejeitado',
  [OrderStatus.PAID]: 'Pago',
};

export function OrderCard({ order, onUploadSuccess }: OrderCardProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string; fileType: 'image' | 'pdf' } | null>(null);

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Apenas imagens ou PDF são permitidos');
      return;
    }

    // Validar tamanho
    const maxSize = file.type === 'application/pdf' ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`Arquivo muito grande (máximo ${maxSize / 1024 / 1024}MB)`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('proof', file);

      const result = await uploadPaymentProof(order.id, formData);

      if (!result.success) {
        setUploadError(result.error || 'Erro ao enviar comprovante');
        return;
      }

      setShowUploadModal(false);
      onUploadSuccess?.();
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao enviar comprovante');
    } finally {
      setUploading(false);
    }
  };

  const canUploadProof =
    !order.usesCredit &&
    order.status === OrderStatus.PENDING_PAYMENT &&
    (!order.paymentProofs || order.paymentProofs.length === 0);

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Pedido</p>
            <p className="font-mono font-bold text-gray-900">{order.orderCode}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </div>
        </div>

        <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
          <p className="font-medium text-gray-900">{order.kit?.name || 'Kit'}</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total:</span>
            <span className="font-semibold text-gray-900">R$ {(Number(order.totalPrice)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Data:</span>
            <span className="text-gray-900">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        {order.usesCredit && order.status === OrderStatus.PAID && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-sm text-green-800">
            ✓ Pago com créditos disponíveis
          </div>
        )}

        {canUploadProof && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-sm font-medium text-yellow-900 mb-2">Comprovante necessário</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-sm text-yellow-700 hover:text-yellow-900 font-medium underline"
            >
              Enviar comprovante de pagamento
            </button>
          </div>
        )}

        {order.paymentProofs && order.paymentProofs.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Comprovantes:</p>
            <div className="space-y-1">
              {order.paymentProofs.map((proof) => (
                <button
                  key={proof.id}
                  onClick={() => setSelectedImage({ url: proof.fileUrl, name: proof.originalFileName, fileType: proof.fileType })}
                  className="text-xs text-blue-600 hover:text-blue-700 underline block truncate text-left w-full"
                  title={proof.originalFileName}
                >
                  📎 {proof.originalFileName}
                </button>
              ))}
            </div>
          </div>
        )}

        {order.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-800">
            <p className="font-medium mb-1">Motivo da rejeição:</p>
            <p>{order.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <ResponsiveModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadError(null);
        }}
        title="Enviar Comprovante"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Envie uma imagem ou PDF do comprovante de pagamento para o pedido{' '}
            <span className="font-mono font-bold">{order.orderCode}</span>
          </p>

          <FileUpload
            id="proof-upload"
            accept="image/*,.pdf"
            onChange={handleProofUpload}
            label="Clique ou arraste um arquivo"
            dragText="Apenas imagens ou PDF são aceitos"
            disabled={uploading}
          />

          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {uploadError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(false)}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </ResponsiveModal>

      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          title={`Comprovante: ${selectedImage.name}`}
          alt={selectedImage.name}
          fileType={selectedImage.fileType}
        />
      )}
    </>
  );
}

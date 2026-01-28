'use client';

import { Order, OrderStatus, PaymentProof } from '@/lib/types/shop.types';
import { formatDate } from '@/lib/utils/dateUtils';
import { useState, useEffect } from 'react';
import ResponsiveModal from '@/components/ResponsiveModal';
import { ImageModal } from '@/components/ImageModal';
import { AdminOrderDetailsModal } from './AdminOrderDetailsModal';
import { approveOrder, rejectOrder } from '@/app/actions/shop';
import { shopService } from '@/lib/services/shop.service';
import Button from '@/components/ui/Button';

interface AdminOrderCardProps {
  order: Order;
  onActionSuccess?: () => void;
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

export function AdminOrderCard({ order, onActionSuccess }: AdminOrderCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>(order.paymentProofs || []);
  const [loadingProofs, setLoadingProofs] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string; fileType: 'image' | 'pdf' } | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Buscar paymentProofs se não foram fornecidos
  useEffect(() => {
    const fetchPaymentProofs = async () => {
      if (order.paymentProofs && order.paymentProofs.length > 0) {
        return; // Já tem os proofs
      }

      if (order.usesCredit) {
        return; // Pedidos com crédito não precisam de proofs
      }

      setLoadingProofs(true);
      try {
        const proofs = await shopService.paymentProofs.getByOrder(order.id);
        setPaymentProofs(proofs);
      } catch (err) {
        console.error('Erro ao buscar comprovantes:', err);
      } finally {
        setLoadingProofs(false);
      }
    };

    fetchPaymentProofs();
  }, [order.id, order.paymentProofs, order.usesCredit]);

  const canApprove =
    [OrderStatus.PENDING_APPROVAL, OrderStatus.PAID].includes(order.status) &&
    (order.usesCredit || (paymentProofs && paymentProofs.length > 0));

  const canReject = [OrderStatus.PENDING_APPROVAL, OrderStatus.PENDING_PAYMENT].includes(
    order.status
  );

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique abra o modal de detalhes
    setLoading(true);
    setError(null);

    try {
      const result = await approveOrder(order.id);

      if (!result.success) {
        setError(result.error || 'Erro ao aprovar pedido');
        return;
      }

      onActionSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao aprovar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await rejectOrder(order.id, rejectReason);

      if (!result.success) {
        setError(result.error || 'Erro ao rejeitar pedido');
        return;
      }

      setShowRejectModal(false);
      setRejectReason('');
      onActionSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao rejeitar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer"
        onClick={() => setShowDetailsModal(true)}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Pedido</p>
            <p className="font-mono font-bold text-gray-900">{order.orderCode}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-600">Cliente</p>
            <p className="font-medium text-gray-900">{order.personName || order.person?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">{order.productId ? 'Produto' : 'Kit'}</p>
            <p className="font-medium text-gray-900">
              {order.productId 
                ? (order.product?.name || 'Produto') 
                : (order.kitName || order.kit?.name || 'N/A')
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total</p>
            <p className="font-bold text-green-600">R$ {Number(order.totalPrice).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Data</p>
            <p className="text-gray-900">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Comprovante */}
        {paymentProofs && paymentProofs.length > 0 && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-semibold text-green-900 mb-2">✓ Comprovante(s) anexado(s):</p>
            <div className="space-y-1">
              {paymentProofs.map((proof) => (
                <button
                  key={proof.id}
                  onClick={() => setSelectedImage({ url: proof.fileUrl, name: proof.originalFileName, fileType: proof.fileType })}
                  className="text-xs text-green-700 hover:text-green-900 underline block text-left w-full"
                >
                  🔗 {proof.originalFileName}
                </button>
              ))}
            </div>
          </div>
        )}

        {order.usesCredit && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
            💳 Pago com créditos disponíveis
          </div>
        )}

        {!order.usesCredit && (!paymentProofs || paymentProofs.length === 0) && !loadingProofs && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
            ⚠️ Nenhum comprovante anexado
          </div>
        )}

        {loadingProofs && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
            🔄 Carregando comprovantes...
          </div>
        )}

        {/* Observações */}
        {order.notes && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">📝 Observações:</p>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Botões */}
        {(canApprove || canReject) && (
          <div className="flex gap-2">
            {canApprove && (
              <Button
                variant='outline-success'
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 w-full"
              >
                {loading ? 'Processando...' : '✓ Aprovar'}
              </Button>
            )}
            {canReject && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation(); // Previne que o clique abra o modal de detalhes
                  setShowRejectModal(true);
                }}
                variant='outline-danger'
                disabled={loading}
                className="flex-1 w-full"
              >
                ✕ Rejeitar
              </Button>
            )}
          </div>
        )}

        {order.status === OrderStatus.APPROVED && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-900">
            ✓ Pedido aprovado por {order.approvedBy?.name} em {formatDate(order.approvedAt)}
          </div>
        )}

        {order.status === OrderStatus.REJECTED && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
            <p className="font-medium text-red-900 mb-1">Motivo da rejeição:</p>
            <p className="text-red-800">{order.rejectionReason || 'Não informado'}</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <ResponsiveModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setError(null);
        }}
        title="Rejeitar Pedido"
      >
        <form onSubmit={handleReject} className="space-y-4 p-4">
          <p className="text-sm text-gray-600">
            Pedido: <span className="font-mono font-bold">{order.orderCode}</span>
          </p>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-900 mb-1">
              Motivo da rejeição
            </label>
            <textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Dados da transferência incorretos..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 resize-none"
              rows={3}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant='outline'
              onClick={() => {
                setShowRejectModal(false)
              }}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={loading}              
              className="flex-1"
            >
              {loading ? 'Processando...' : 'Rejeitar'}
            </Button>
          </div>
        </form>
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

      <AdminOrderDetailsModal
        order={order}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </>
  );
}

'use client';

import { Order, OrderStatus } from '@/lib/types/shop.types';
import { formatDate } from '@/lib/utils/dateUtils';
import { useState } from 'react';
import ResponsiveModal from '@/components/ResponsiveModal';
import { approveOrder, rejectOrder } from '@/app/actions/shop';

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

  const canApprove =
    [OrderStatus.PENDING_APPROVAL, OrderStatus.PAID].includes(order.status) &&
    (order.usesCredit || (order.paymentProofs && order.paymentProofs.length > 0));

  const canReject = [OrderStatus.PENDING_APPROVAL, OrderStatus.PENDING_PAYMENT].includes(
    order.status
  );

  const handleApprove = async () => {
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
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
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
            <p className="text-xs text-gray-600">Kit</p>
            <p className="font-medium text-gray-900">{order.kitName || order.kit?.name || 'N/A'}</p>
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
        {order.paymentProofs && order.paymentProofs.length > 0 && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-semibold text-green-900 mb-2">✓ Comprovante(s) anexado(s):</p>
            <div className="space-y-1">
              {order.paymentProofs.map((proof) => (
                <a
                  key={proof.id}
                  href={proof.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-700 hover:text-green-900 underline block"
                >
                  🔗 {proof.originalFileName}
                </a>
              ))}
            </div>
          </div>
        )}

        {order.usesCredit && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
            💳 Pago com créditos disponíveis
          </div>
        )}

        {!order.usesCredit && (!order.paymentProofs || order.paymentProofs.length === 0) && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
            ⚠️ Nenhum comprovante anexado
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
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Processando...' : '✓ Aprovar'}
              </button>
            )}
            {canReject && (
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                ✕ Rejeitar
              </button>
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
        <form onSubmit={handleReject} className="space-y-4">
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
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Rejeitar'}
            </button>
          </div>
        </form>
      </ResponsiveModal>
    </>
  );
}

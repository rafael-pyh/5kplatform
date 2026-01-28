'use client';

import { Order, OrderStatus, PaymentProof } from '@/lib/types/shop.types';
import { formatDate } from '@/lib/utils/dateUtils';
import ResponsiveModal from '@/components/ResponsiveModal';
import { ImageModal } from '@/components/ImageModal';
import { useState, useEffect } from 'react';
import { shopService } from '@/lib/services/shop.service';

interface AdminOrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
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

export function AdminOrderDetailsModal({ order, isOpen, onClose }: AdminOrderDetailsModalProps) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string; fileType: 'image' | 'pdf' } | null>(null);
  const [fullOrder, setFullOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // Buscar detalhes completos do pedido quando o modal for aberto
  useEffect(() => {
    if (isOpen && order && !fullOrder) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        try {
          const completeOrder = await shopService.orders.getById(order.id);
          setFullOrder(completeOrder);
        } catch (err) {
          console.error('Erro ao buscar detalhes do pedido:', err);
          // Fallback para os dados parciais
          setFullOrder(order);
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetails();
    } else if (!isOpen) {
      // Limpar dados quando o modal for fechado
      setFullOrder(null);
    }
  }, [isOpen, order, fullOrder]);

  // Usar os dados completos se disponíveis, senão os parciais
  const displayOrder = fullOrder || order;

  if (!displayOrder) return null;

  return (
    <>
      <ResponsiveModal
        isOpen={isOpen}
        onClose={onClose}
        title={`Detalhes do Pedido - ${displayOrder.orderCode}`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando detalhes...</span>
          </div>
        ) : (
          <div className="space-y-6 p-4">
            {/* Status e Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Código do Pedido</p>
                <p className="font-mono font-bold text-gray-900">{displayOrder.orderCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${statusColors[displayOrder.status]}`}>
                  {statusLabels[displayOrder.status]}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data do Pedido</p>
                <p className="font-medium text-gray-900">{formatDate(displayOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="font-bold text-green-600">R$ {Number(displayOrder.totalPrice).toFixed(2)}</p>
              </div>
            </div>

            {/* Informações do Cliente */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium text-gray-900">{displayOrder.personName || displayOrder.person?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{displayOrder.person?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Informações do Produto/Kit */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {displayOrder.productId ? 'Produto' : 'Kit'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {displayOrder.productId ? 'Nome do Produto' : 'Nome do Kit'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {displayOrder.productId 
                      ? (displayOrder.product?.name || 'Produto') 
                      : (displayOrder.kitName || displayOrder.kit?.name || 'N/A')
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {displayOrder.productId ? 'Preço do Produto' : 'Preço do Kit'}
                  </p>
                  <p className="font-medium text-gray-900">
                    R$ {displayOrder.productId 
                      ? (displayOrder.product?.price ? Number(displayOrder.product.price).toFixed(2) : 'N/A')
                      : (displayOrder.kit?.price ? Number(displayOrder.kit.price).toFixed(2) : 'N/A')
                    }
                  </p>
                </div>
              </div>

              {/* Mostrar itens do kit apenas se for kit */}
              {!displayOrder.productId && displayOrder.kit?.items && displayOrder.kit.items.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Itens do Kit:</p>
                  <div className="space-y-2">
                    {displayOrder.kit.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName || item.product?.name || 'Produto'}</p>
                          <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                          {item.notes && <p className="text-sm text-gray-600">Obs: {item.notes}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            R$ {item.unitPrice ? (Number(item.unitPrice) * item.quantity).toFixed(2) : item.product?.price ? (Number(item.product.price) * item.quantity).toFixed(2) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mostrar descrição do produto se for produto */}
              {displayOrder.productId && displayOrder.product?.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Descrição do Produto:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {displayOrder.product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Pagamento */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pagamento</h3>
              <div className="space-y-3">
                {displayOrder.usesCredit && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900">💳 Pago com créditos disponíveis</p>
                  </div>
                )}

                {displayOrder.paymentProofs && displayOrder.paymentProofs.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Comprovantes de Pagamento:</p>
                    <div className="space-y-2">
                      {displayOrder.paymentProofs.map((proof) => (
                        <button
                          key={proof.id}
                          onClick={() => setSelectedImage({ url: proof.fileUrl, name: proof.originalFileName, fileType: proof.fileType })}
                          className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-green-900">📎 {proof.originalFileName}</p>
                          <p className="text-xs text-green-700">Enviado em {formatDate(proof.createdAt)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!displayOrder.usesCredit && (!displayOrder.paymentProofs || displayOrder.paymentProofs.length === 0) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-900">⚠️ Nenhum comprovante anexado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            {displayOrder.notes && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{displayOrder.notes}</p>
                </div>
              </div>
            )}

            {/* Histórico */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Histórico</h3>
              <div className="space-y-2">
                {displayOrder.approvedAt && displayOrder.approvedBy && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-900">✓ Aprovado</p>
                    <p className="text-xs text-green-700">
                      Por {displayOrder.approvedBy.name} em {formatDate(displayOrder.approvedAt)}
                    </p>
                  </div>
                )}

                {displayOrder.status === OrderStatus.REJECTED && displayOrder.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-900">✕ Rejeitado</p>
                    <p className="text-xs text-red-700">Motivo: {displayOrder.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
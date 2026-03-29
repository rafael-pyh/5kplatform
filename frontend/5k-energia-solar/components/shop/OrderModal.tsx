'use client';

import { Kit, Product } from '@/lib/types/shop.types';
import { useState, useEffect } from 'react';
import ResponsiveModal from '../ResponsiveModal';
import { useAuth } from '@/contexts/AuthContext';
import { shopService } from '@/lib/services/shop.service';
import { Button } from '../ui';

interface OrderModalProps {
  kit: Kit | null;
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderCode: string) => void;
}

export function OrderModal({ kit, product, isOpen, onClose, onSuccess }: OrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [useCredit, setUseCredit] = useState(false);
  const [fullKit, setFullKit] = useState<Kit | null>(null);
  const [loadingKit, setLoadingKit] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Buscar detalhes completos do kit quando o modal abrir
  useEffect(() => {
    if (isOpen && kit?.id) {
      setLoadingKit(true);
      shopService.kits.getById(kit.id)
        .then((kitDetails) => {
          setFullKit(kitDetails);
        })
        .catch((err) => {
          console.error('Erro ao carregar detalhes do kit:', err);
          setError('Erro ao carregar detalhes do kit');
        })
        .finally(() => {
          setLoadingKit(false);
        });
    } else {
      setFullKit(null);
      setError(null);
    }
  }, [isOpen, kit?.id]);

  if (!kit && !product) return null;

  const currentKit = fullKit || kit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validação: se não usar créditos, comprovante é obrigatório
      if (!useCredit && !paymentProof) {
        setError('Comprovante de pagamento é obrigatório quando não usar créditos');
        setLoading(false);
        return;
      }

      const result = await shopService.orders.create({
        kitId: kit?.id,
        productId: product?.id,
        useCredit,
        notes,
      });

      if (!result) {
        setError('Resposta da API vazia');
        return;
      }

      // Se não usar créditos e tiver comprovante, fazer upload
      if (!useCredit && paymentProof) {
        setUploadingProof(true);
        try {
          const formData = new FormData();
          formData.append('proof', paymentProof);

          await shopService.paymentProofs.upload(result.id, formData);
        } catch (uploadError: any) {
          console.error('Erro ao fazer upload do comprovante:', uploadError);
          // Não falhar o pedido por erro no upload, apenas logar
          setError('Pedido criado, mas houve erro no upload do comprovante. Você pode enviá-lo depois.');
        } finally {
          setUploadingProof(false);
        }
      }

      onSuccess(result.orderCode);
      setNotes('');
      setUseCredit(false);
      setPaymentProof(null);
    } catch (err: any) {
      console.error('Erro no handleSubmit:', err);
      setError(err.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title={`Solicitar: ${kit ? kit.name : product?.name || 'Produto'}`}>
      <form onSubmit={handleSubmit} className="space-y-4 p-2">
        {/* Resumo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">
            Resumo {kit ? 'do Kit' : 'do Produto'}
          </h4>

          {kit ? (
            <>
              {/* Produtos no Kit */}
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Produtos incluídos:</h5>
                {loadingKit ? (
                  <div className="space-y-2">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 bg-white rounded border p-3">
                    {currentKit && currentKit.items && currentKit.items.length > 0 ? (
                      currentKit.items.map((item, idx) => {
                        // A API pode retornar productName/productPrice diretamente ou um objeto product
                        const productName = item.product?.name || (item as any).productName || 'Produto sem nome';
                        const productPrice = item.product?.price || (item as any).productPrice;

                        return (
                          <div key={idx} className="flex justify-between items-center py-1">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                {productName}
                              </span>
                              {item.notes && (
                                <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-gray-600">×{item.quantity}</span>
                              {productPrice && (
                                <span className="text-sm text-gray-500 ml-2">
                                  R$ {(Number(productPrice) * item.quantity).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500 py-2">
                        Nenhum produto encontrado neste kit
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : product ? (
            <div className="mb-3">
              <div className="bg-white rounded border p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  <span className="text-sm text-gray-500">R$ {Number(product.price).toFixed(2)}</span>
                </div>
                {product.description && (
                  <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-green-600">
              R$ {Number(kit ? kit.price : product?.price || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Opção de Crédito */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useCredit}
              onChange={(e) => setUseCredit(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="ml-3 text-sm font-medium text-gray-900">
              Pagar com créditos disponíveis
            </span>
          </label>
          <p className="text-xs text-gray-600 mt-2 ml-7">
            Se desmarcar, você deverá fazer a transferência e anexar o comprovante
          </p>
        </div>

        {/* Upload de Comprovante (apenas quando não usar créditos) */}
        {!useCredit && (
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Comprovante de Pagamento *
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validar tamanho (max 10MB)
                    if (file.size > 10 * 1024 * 1024) {
                      setError('Arquivo muito grande. Máximo 10MB.');
                      return;
                    }
                    // Validar tipo
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
                    if (!allowedTypes.includes(file.type)) {
                      setError('Tipo de arquivo não permitido. Use apenas imagens ou PDF.');
                      return;
                    }
                    setPaymentProof(file);
                    setError(null);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {paymentProof && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                  <span className="text-sm text-green-800">
                    📎 {paymentProof.name} ({(paymentProof.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaymentProof(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remover
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formatos aceitos: PNG, JPEG, GIF, WebP ou PDF. Tamanho máximo: 10MB.
              </p>
            </div>
          </div>
        )}

        {/* Observação */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-900 mb-1">
            Observações (opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: endereço de entrega, informações especiais..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="danger"
            onClick={onClose}
            disabled={loading || loadingKit || uploadingProof}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || loadingKit || uploadingProof}
            className="flex-1"
          >
            {uploadingProof ? 'Enviando comprovante...' : loading ? 'Processando...' : loadingKit ? 'Carregando...' : 'Confirmar Pedido'}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

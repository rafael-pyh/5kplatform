'use client';

import { Kit } from '@/lib/types/shop.types';
import { useState } from 'react';
import ResponsiveModal from '../ResponsiveModal';
import { createOrder } from '@/app/actions/shop';

interface OrderModalProps {
  kit: Kit | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderCode: string) => void;
}

export function OrderModal({ kit, isOpen, onClose, onSuccess }: OrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [useCredit, setUseCredit] = useState(false);

  if (!kit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createOrder({
        kitId: kit.id,
        useCredit,
        notes,
      });

      if (!result.success) {
        setError(result.error || 'Erro ao criar pedido');
        return;
      }

      onSuccess(result.data?.orderCode);
      setNotes('');
      setUseCredit(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title={`Solicitar: ${kit.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resumo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Resumo do Kit</h4>
          <div className="space-y-2 mb-3 pb-3 border-b border-blue-200">
            {kit.items.map((item, idx) => (
              <div key={idx} className="text-sm text-gray-700 flex justify-between">
                <span>{item.product?.name || 'Produto'}</span>
                <span className="text-gray-500">×{item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-green-600">R$ {kit.price.toFixed(2)}</span>
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
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

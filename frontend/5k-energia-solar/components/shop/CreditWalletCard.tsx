'use client';

import { CreditStats, CreditTransaction, CreditTransactionType } from '@/lib/types/shop.types';
import { formatDate } from '@/lib/utils/dateUtils';
import { useState } from 'react';
import ResponsiveModal from '../ResponsiveModal';
import { requestWithdrawal } from '@/app/actions/shop';

interface CreditWalletCardProps {
  stats: CreditStats | null;
  onWithdrawalRequest?: () => void;
}

export function CreditWalletCard({ stats, onWithdrawalRequest }: CreditWalletCardProps) {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  if (!stats) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Digite um valor válido');
      return;
    }

    if (amount > stats.balance) {
      setWithdrawError(`Saldo insuficiente (disponível: R$ ${stats.balance.toFixed(2)})`);
      return;
    }

    setWithdrawLoading(true);

    try {
      const result = await requestWithdrawal({
        amount,
        notes: 'Solicitação de saque via painel',
      });

      if (!result.success) {
        setWithdrawError(result.error || 'Erro ao solicitar saque');
        return;
      }

      setShowWithdrawalModal(false);
      setWithdrawAmount('');
      onWithdrawalRequest?.();
    } catch (err: any) {
      setWithdrawError(err.message || 'Erro ao solicitar saque');
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <>
      <div className="bg-linear-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Saldo de Créditos</p>
          <p className="text-3xl font-bold text-green-600">R$ {stats.balance.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 py-4 border-y border-green-200">
          <div>
            <p className="text-xs text-gray-600">Ganhos</p>
            <p className="text-lg font-semibold text-green-600">
              +R$ {(Number(stats.totalEarned)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Gastos</p>
            <p className="text-lg font-semibold text-red-600">
              -R$ {(Number(stats.totalSpent)).toFixed(2)}
            </p>
          </div>
        </div>

        {stats.lastTransaction && (
          <p className="text-xs text-gray-600 mb-4">
            Última transação: {formatDate(stats.lastTransaction)}
          </p>
        )}

        <button
          onClick={() => setShowWithdrawalModal(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Solicitar Saque
        </button>
      </div>

      {/* Withdrawal Modal */}
      <ResponsiveModal
        isOpen={showWithdrawalModal}
        onClose={() => {
          setShowWithdrawalModal(false);
          setWithdrawError(null);
        }}
        title="Solicitar Saque"
      >
        <form onSubmit={handleWithdrawalSubmit} className="space-y-4 p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Saldo disponível:{' '}
              <span className="font-bold text-lg text-blue-600">R$ {stats.balance.toFixed(2)}</span>
            </p>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-1">
              Valor (R$)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={stats.balance}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
            <p className="font-medium mb-1">⏱️ Próximos passos:</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-800">
              <li>Solicitação será enviada para aprovação</li>
              <li>Admin aprovará e realizará a transferência</li>
              <li>Você será notificado quando receber</li>
            </ol>
          </div>

          {withdrawError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {withdrawError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowWithdrawalModal(false)}
              disabled={withdrawLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={withdrawLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {withdrawLoading ? 'Processando...' : 'Confirmar Saque'}
            </button>
          </div>
        </form>
      </ResponsiveModal>
    </>
  );
}

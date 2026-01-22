'use client';

import { WithdrawalRequest, WithdrawalStatus } from '@/lib/types/shop.types';
import { formatDate } from '@/lib/utils/dateUtils';
import { useState } from 'react';
import { approveWithdrawal, rejectWithdrawal, markWithdrawalAsPaid } from '@/app/actions/shop';

interface AdminWithdrawalCardProps {
  withdrawal: WithdrawalRequest;
  onActionSuccess?: () => void;
}

const statusColors: Record<WithdrawalStatus, string> = {
  [WithdrawalStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [WithdrawalStatus.APPROVED]: 'bg-blue-100 text-blue-800',
  [WithdrawalStatus.PAID]: 'bg-green-100 text-green-800',
  [WithdrawalStatus.REJECTED]: 'bg-red-100 text-red-800',
};

const statusLabels: Record<WithdrawalStatus, string> = {
  [WithdrawalStatus.PENDING]: 'Pendente',
  [WithdrawalStatus.APPROVED]: 'Aprovado',
  [WithdrawalStatus.PAID]: 'Pago',
  [WithdrawalStatus.REJECTED]: 'Rejeitado',
};

export function AdminWithdrawalCard({ withdrawal, onActionSuccess }: AdminWithdrawalCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await approveWithdrawal(withdrawal.id);

      if (!result.success) {
        setError(result.error || 'Erro ao aprovar');
        return;
      }

      onActionSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao aprovar');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await rejectWithdrawal(withdrawal.id);

      if (!result.success) {
        setError(result.error || 'Erro ao rejeitar');
        return;
      }

      onActionSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao rejeitar');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await markWithdrawalAsPaid(withdrawal.id);

      if (!result.success) {
        setError(result.error || 'Erro ao marcar como pago');
        return;
      }

      onActionSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao marcar como pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-600">Solicitação de Saque</p>
          <p className="font-bold text-lg text-gray-900">R$ {Number(withdrawal.amount).toFixed(2)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[withdrawal.status]}`}>
          {statusLabels[withdrawal.status]}
        </div>
      </div>

      <div className="space-y-2 mb-3 pb-3 border-b border-gray-100 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Data de Solicitação:</span>
          <span className="font-medium text-gray-900">{formatDate(withdrawal.createdAt)}</span>
        </div>

        {withdrawal.approvedAt && (
          <div className="flex justify-between">
            <span className="text-gray-600">Aprovado em:</span>
            <span className="font-medium text-gray-900">{formatDate(withdrawal.approvedAt)}</span>
          </div>
        )}

        {withdrawal.paidAt && (
          <div className="flex justify-between">
            <span className="text-gray-600">Pago em:</span>
            <span className="font-medium text-green-700">{formatDate(withdrawal.paidAt)}</span>
          </div>
        )}
      </div>

      {withdrawal.bankAccountInfo && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-1">Dados para transferência:</p>
          <p className="text-sm text-blue-800 break-all">{withdrawal.bankAccountInfo}</p>
        </div>
      )}

      {withdrawal.notes && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-1">Observações:</p>
          <p className="text-sm text-gray-700">{withdrawal.notes}</p>
        </div>
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-2">
        {withdrawal.status === WithdrawalStatus.PENDING && (
          <>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Aprovar'}
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Rejeitar'}
            </button>
          </>
        )}

        {withdrawal.status === WithdrawalStatus.APPROVED && (
          <button
            onClick={handleMarkAsPaid}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '...' : '✓ Marcar como Pago'}
          </button>
        )}

        {withdrawal.status === WithdrawalStatus.PAID && (
          <div className="flex-1 px-3 py-2 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-lg text-center">
            ✓ Transferência realizada
          </div>
        )}

        {withdrawal.status === WithdrawalStatus.REJECTED && (
          <div className="flex-1 px-3 py-2 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-lg text-center">
            ✕ Rejeitado
          </div>
        )}
      </div>
    </div>
  );
}

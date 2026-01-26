'use client';

import { WithdrawalRequest, WithdrawalStatus, PersonDetails } from '@/lib/types/shop.types';
import { formatDate } from '@/lib/utils/dateUtils';
import { useState, useEffect } from 'react';
import { approveWithdrawal, rejectWithdrawal, markWithdrawalAsPaid } from '@/app/actions/shop';
import { shopService } from '@/lib/services/shop.service';
import { Button } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { toast } from 'react-hot-toast';

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
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [personDetails, setPersonDetails] = useState<PersonDetails | null>(null);
  const [personLoading, setPersonLoading] = useState(false);

  // Buscar dados da pessoa quando o componente for montado
  useEffect(() => {
    const fetchPersonDetails = async () => {
    
      if (!withdrawal.personId) {
        return;
      }

      setPersonLoading(true);
      try {
        const details = await shopService.persons.getDetailsForAdmin(withdrawal.personId);
        console.log('Dados da pessoa:', details);
        setPersonDetails(details);
      } catch (err: any) {
        console.error('Erro ao buscar dados da pessoa:', err);
        // Não definir erro para não interferir com outras operações
      } finally {
        setPersonLoading(false);
      }
    };

    fetchPersonDetails();
  }, [withdrawal.personId]);

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
    if (!rejectReason.trim()) {
      setError('Motivo da rejeição é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await rejectWithdrawal(withdrawal.id, rejectReason.trim());

      if (!result.success) {
        setError(result.error || 'Erro ao rejeitar');
        return;
      }

      setShowRejectForm(false);
      setRejectReason('');
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

      {/* Informações da Pessoa */}
      <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 mb-2">Dados do Solicitante:</p>
        {personLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Carregando dados...</span>
          </div>
        ) : personDetails ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Nome:</span>
              <p className="font-medium text-gray-900">{personDetails.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Telefone:</span>
              <p className="font-medium text-gray-900">{personDetails.phone || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Cidade:</span>
              <p className="font-medium text-gray-900">{personDetails.city}/{personDetails.state}</p>
            </div>
            <div>
              <span className="text-gray-600">Chave Pix:</span>
              <div className="flex items-center">
                <p className="font-medium text-gray-900">{personDetails.pixKey || 'N/A'}</p>
                <Button 
                  variant="none"
                  className="p-0 w-fit h-fit focus:ring-0 selection:ring-0 outline-0"
                  onClick={() => {
                    navigator.clipboard.writeText(personDetails.pixKey || '');
                    toast.success('Chave pix copiada com sucesso!');
                  }}
                >
                  <Icon icon="bi-copy" className="w-4 h-4 inline-block ml-1 text-blue-500 hover:text-blue-800" />
                </Button>
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Saldo Atual:</span>
              <p className="font-medium text-green-700">R$ {personDetails.creditBalance.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Não foi possível carregar os dados do solicitante</p>
          </div>
        )}
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

      {showRejectForm && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-900 mb-2">Motivo da rejeição:</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Digite o motivo da rejeição..."
            className="w-full p-2 border border-red-300 rounded-md text-sm resize-none"
            rows={3}
            disabled={loading}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Confirmar Rejeição'}
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason('');
                setError(null);
              }}
              disabled={loading}
              className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
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
              onClick={() => setShowRejectForm(true)}
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

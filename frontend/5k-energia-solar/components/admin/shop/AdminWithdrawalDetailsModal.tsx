'use client';

import { WithdrawalRequest, WithdrawalStatus, PersonDetails } from '@/lib/types/shop.types';
import { formatDate } from '@/lib/utils/dateUtils';
import ResponsiveModal from '@/components/ResponsiveModal';
import { useState, useEffect } from 'react';
import { shopService } from '@/lib/services/shop.service';

interface AdminWithdrawalDetailsModalProps {
  withdrawal: WithdrawalRequest | null;
  isOpen: boolean;
  onClose: () => void;
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

export function AdminWithdrawalDetailsModal({ withdrawal, isOpen, onClose }: AdminWithdrawalDetailsModalProps) {
  const [personDetails, setPersonDetails] = useState<PersonDetails | null>(null);
  const [personLoading, setPersonLoading] = useState(false);

  useEffect(() => {
    const fetchPersonDetails = async () => {
      if (!withdrawal?.personId) {
        setPersonDetails(null);
        return;
      }

      setPersonLoading(true);
      try {
        const details = await shopService.persons.getDetailsForAdmin(withdrawal.personId);
        setPersonDetails(details);
      } catch (err: any) {
        console.error('Erro ao buscar dados da pessoa:', err);
        setPersonDetails(null);
      } finally {
        setPersonLoading(false);
      }
    };

    if (isOpen && withdrawal) {
      fetchPersonDetails();
    }
  }, [withdrawal?.personId, isOpen]);

  if (!withdrawal) return null;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes do Saque - R$ ${Number(withdrawal.amount).toFixed(2)}`}
    >
      <div className="space-y-6 p-4">
        {/* Status e Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">ID da Solicitação</p>
            <p className="font-mono font-bold text-gray-900">{withdrawal.id.slice(-8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${statusColors[withdrawal.status]}`}>
              {statusLabels[withdrawal.status]}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Solicitado</p>
            <p className="font-bold text-green-600">R$ {Number(withdrawal.amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Data da Solicitação</p>
            <p className="font-medium text-gray-900">{formatDate(withdrawal.createdAt)}</p>
          </div>
        </div>

        {/* Informações do Solicitante */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Solicitante</h3>
          {personLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Carregando dados...</span>
            </div>
          ) : personDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium text-gray-900">{personDetails.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{personDetails.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium text-gray-900">{personDetails.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cidade/Estado</p>
                <p className="font-medium text-gray-900">{personDetails.city}/{personDetails.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Chave Pix</p>
                <p className="font-medium text-gray-900 break-all">{personDetails.pixKey || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Atual</p>
                <p className="font-medium text-green-700">
                  R$ {(
                    personDetails.creditBalance +
                    (withdrawal.status === WithdrawalStatus.PENDING || withdrawal.status === WithdrawalStatus.APPROVED
                      ? Number(withdrawal.amount)
                      : 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Não foi possível carregar os dados do solicitante</p>
            </div>
          )}
        </div>

        {/* Dados para Transferência */}
        {withdrawal.bankAccountInfo && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados para Transferência</h3>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 whitespace-pre-wrap break-all">{withdrawal.bankAccountInfo}</p>
            </div>
          </div>
        )}

        {/* Observações */}
        {withdrawal.notes && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{withdrawal.notes}</p>
            </div>
          </div>
        )}

        {/* Histórico */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Histórico</h3>
          <div className="space-y-2">
            {withdrawal.approvedAt && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">✓ Aprovado</p>
                <p className="text-xs text-blue-700">Em {formatDate(withdrawal.approvedAt)}</p>
              </div>
            )}

            {withdrawal.paidAt && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-900">💰 Pago</p>
                <p className="text-xs text-green-700">Em {formatDate(withdrawal.paidAt)}</p>
              </div>
            )}

            {withdrawal.status === WithdrawalStatus.REJECTED && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-900">✕ Rejeitado</p>
                <p className="text-xs text-red-700">Em {formatDate(withdrawal.rejectedAt || withdrawal.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
'use client';

import { memo } from 'react';
import { Person } from '@/types/Person';
import SellerTableRow from './SellerTableRow';
import EmptyState from '@/components/ui/EmptyState';
import { approveSeller, rejectSeller, resendActivationEmail } from '@/lib/actions/sellerActions';
import toast from 'react-hot-toast';
import { Button } from '../ui';

interface SellerTableProps {
  persons: Person[];
  onViewQRCode: (person: Person) => void;
  onEdit: (person: Person) => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
  onRefetch?: () => void;
}

function SellerTable({ persons, onViewQRCode, onEdit, onDeactivate, onActivate, onRefetch }: SellerTableProps) {
  const handleApprove = async (id: string) => {
    try {
      await approveSeller(id);
      toast.success('Vendedor aprovado com sucesso!');
      onRefetch?.();
    } catch (error) {
      console.error('Erro ao aprovar vendedor:', error);
      toast.error('Erro ao aprovar vendedor.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectSeller(id);
      toast.success('Vendedor rejeitado com sucesso!');
      onRefetch?.();
    } catch (error) {
      console.error('Erro ao rejeitar vendedor:', error);
      toast.error('Erro ao rejeitar vendedor.');
    }
  };

  const handleResendActivationEmail = async (id: string) => {
    try {
      await resendActivationEmail(id);
      toast.success('Email de ativação reenviado com sucesso!');
    } catch (error) {
      console.error('Erro ao reenviar email de ativação:', error);
      toast.error('Erro ao reenviar email de ativação.');
    }
  };

  if (persons.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
        title="Nenhum vendedor encontrado"
        description="Comece adicionando um novo vendedor para gerenciar leads e QR codes."
      />
    );
  }

  return (
    <div className="w-full max-w-full">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vendedor
              </th>
              <th
                scope="col"
                className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Telefone
              </th>
              <th
                scope="col"
                className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Chave Pix
              </th>
              <th
                scope="col"
                className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                CPF
              </th>
              <th
                scope="col"
                className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Data de Nascimento
              </th>
              <th
                scope="col"
                className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Escaneamentos
              </th>
              <th
                scope="col"
                className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Localização
              </th>
              <th
                scope="col"
                className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipo de Comissão
              </th>
              <th
                scope="col"
                className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th scope="col" className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {persons.map((person) => (
              <SellerTableRow
                key={person.id}
                person={person}
                onViewQRCode={onViewQRCode}
                onEdit={onEdit}
                onDeactivate={onDeactivate}
                onActivate={onActivate}
                onApprove={() => handleApprove(person.id)}
                onReject={() => handleReject(person.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {persons.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            {/* Name and Email */}
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900 truncate" title={person.name}>
                {person.name}
              </h3>
              <p className="text-xs text-gray-500 truncate" title={person.email}>
                {person.email}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <p className="text-gray-500 font-medium mb-1">Telefone</p>
                <p className="text-gray-900 font-medium" title={person.phone}>
                  {person.phone || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Escaneamentos</p>
                <p className="text-gray-900 font-medium text-center">
                  {person.scanCount || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Localização</p>
                <p className="text-gray-900 font-medium" title={`${person.city}/${person.state}`}>
                  {person.city || '-'}/{person.state || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Chave Pix</p>
                <p className="text-gray-900 font-medium text-xs truncate" title={person.pixKey}>
                  {person.pixKey ? person.pixKey.substring(0, 8) + '...' : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">CPF</p>
                <p className="text-gray-900 font-medium text-xs" title={person.cpf}>
                  {person.cpf || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Tipo Comissão</p>
                <p className="text-gray-900 font-medium text-xs">
                  {person.commissionType === 'FIXED' ? 'Valor Fixo' : 'Porcentagem'}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <p className="text-gray-500 font-medium mb-1 text-xs">Status</p>
              <div className="flex items-center justify-between">
                <div>
                  {person.approvalStatus === 'pending' && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendente
                    </span>
                  )}
                  {person.approvalStatus === 'approved' && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {person.active ? 'Ativo' : 'Inativo'}
                    </span>
                  )}
                  {person.approvalStatus === 'rejected' && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Rejeitado
                    </span>
                  )}
                </div>
                {person.approvalStatus === 'approved' && !person.emailVerified && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResendActivationEmail(person.id);
                    }}
                    variant="outline-blue"
                    className="text-xs"
                    title="Reenviar email de ativação"
                  >
                    Reenviar
                  </Button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
              <Button
                onClick={() => onViewQRCode(person)}
                variant="outline-blue"
                className="font-medium text-xs w-1/3"
              >
                QR Code
              </Button>
              {person.approvalStatus === 'pending' ? (
                <>
                  <Button
                    onClick={() => handleApprove(person.id)}
                    variant="outline-green"
                    className="font-medium text-xs w-1/3"
                  >
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleReject(person.id)}
                    variant="outline-danger"
                    className="font-medium text-xs w-1/3"
                  >
                    Rejeitar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => onEdit(person)}
                    variant="outline-blue"
                    className="font-medium text-xs w-1/3"
                  >
                    Editar
                  </Button>
                  {person.active ? (
                    <Button
                      onClick={() => onDeactivate(person.id)}
                      variant="outline-danger"
                      className="font-medium text-xs w-1/3"
                    >
                      Desativar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onActivate(person.id)}
                      variant="outline-green"
                      className="font-medium text-xs w-1/3"
                    >
                      Ativar
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(SellerTable);

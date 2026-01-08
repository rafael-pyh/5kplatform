'use client';

import { memo, useState } from 'react';
import { Person } from '@/types/Person';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Icon } from '../ui/Icon';
import ConfirmationModal from '@/components/ConfirmationModal';
import { resendVerificationEmailAction } from '@/app/actions/auth';

interface SellerTableRowProps {
  person: Person;
  onViewQRCode: (person: Person) => void;
  onEdit: (person: Person) => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function SellerTableRow({ person, onViewQRCode, onEdit, onDeactivate, onActivate, onApprove, onReject }: SellerTableRowProps) {
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleDeactivateClick = () => {
    setDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = () => {
    setDeactivateModalOpen(false);
    onDeactivate(person.id);
  };

  const handleRejectClick = () => {
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    setRejectModalOpen(false);
    onReject(person.id);
  };

  const handleResendVerificationEmail = async () => {
    setResendingEmail(true);
    try {
      await resendVerificationEmailAction(person.email!);
      // Show toast success message
      alert('Email de verificação reenviado com sucesso!');
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      alert('Erro ao reenviar email de verificação');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={deactivateModalOpen}
        title="Desativar Vendedor"
        message={`Tem certeza que deseja desativar o vendedor ${person.name}? Isso o impedirá de gerar novos leads.`}
        confirmText="Desativar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={rejectModalOpen}
        title="Reprovar Vendedor"
        message={`Tem certeza que deseja reprovar o vendedor ${person.name}?`}
        confirmText="Reprovar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectModalOpen(false)}
      />

      <tr className="hover:bg-gray-50 border-b border-slate-200">
      <td className="px-2 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 shrink-0">
            {person.photoBase64 ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={person.photoBase64}
                alt={person.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-medium text-sm">
                  {person.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{person.name}</div>
            <div className="text-sm text-gray-500">{person.email}</div>
          </div>
        </div>
      </td>
      <td className="px-2 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{person.phone}</div>
      </td>
      <td className="px-2 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{person.pixKey}</div>
      </td>
      <td className="px-2 py-4 whitespace-nowrap text-center">
        <div className="text-sm text-gray-900">{person.scanCount || 0}</div>
      </td>
      <td className="px-2 py-4 whitespace-nowrap text-center">
        <div className="text-sm text-gray-900">{person.city ? `${person.city}/${person.state}` : 'Não informado'}</div>
      </td>
      <td className="px-2 py-4 whitespace-nowrap">
        <Badge variant={person.active ? 'success' : 'danger'}>
          {person.active ? 'Ativo' : 'Inativo'}
        </Badge>
      </td>
      <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onViewQRCode(person)}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="Ver QR Code"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </button>
          <button
            onClick={() => onEdit(person)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Editar Vendedor"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          {person.active && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleDeactivateClick}
            >
              <Icon icon="mdi:account-off-outline" className="w-5 h-5" />
            </Button>
          )}
          {!person.active && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => onActivate(person.id)}
            >
              <Icon icon="mdi:account-check-outline" className="w-5 h-5" />
            </Button>
          )}
          {person.approvalStatus === 'pending' && (
            <>
                <div className="relative group">
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => onApprove(person.id)}
                  disabled={!person.emailVerified}
                >
                  Aprovar
                </Button>
                {!person.emailVerified && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/1 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Usuário não verificou o email ainda, quando for verificado a opção de aprovar será habilitada
                  </div>
                )}
                </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleRejectClick}
              >
                Rejeitar
              </Button>
            </>
          )}
          {!person.emailVerified && (
            <Button
              variant="outline-blue"
              size="sm"
              onClick={handleResendVerificationEmail}
              disabled={resendingEmail}
              title="Reenviar email de verificação"
            >
              <Icon icon="mdi:email-send-outline" className="w-5 h-5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
    </>
  );
}

export default memo(SellerTableRow);

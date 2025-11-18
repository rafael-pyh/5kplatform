'use client';

import { useEffect, useCallback, memo } from 'react';
import { Lead } from '@/lib/types';
import Button from '@/components/ui/Button';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

function LeadDetailsModal({ isOpen, onClose, lead }: LeadDetailsModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const openFile = (url: string) => {
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Detalhes do Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Informações Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Nome</label>
                <p className="text-sm font-medium text-gray-900">{lead.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <p className="text-sm font-medium text-gray-900">{lead.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Telefone</label>
                <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Vendedor</label>
                <p className="text-sm font-medium text-gray-900">{lead.owner?.name || '-'}</p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {(lead.energyBillUrl || lead.roofPhotoUrl) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Anexos</h3>
              <div className="flex gap-2">
                {lead.energyBillUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openFile(lead.energyBillUrl!)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    }
                  >
                    Conta de Luz
                  </Button>
                )}
                {lead.roofPhotoUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openFile(lead.roofPhotoUrl!)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    }
                  >
                    Foto do Telhado
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Status & Date */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <p className="text-sm font-medium text-gray-900">
                  {lead.status === 'BOUGHT' && 'Comprou'}
                  {lead.status === 'NEGOTIATION' && 'Negociando'}
                  {lead.status === 'CANCELLED' && 'Cancelado'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Data de Cadastro</label>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(LeadDetailsModal);

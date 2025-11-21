'use client';

import { memo } from 'react';
import { Lead } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface LeadTableRowProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onUpdateStatus: (lead: Lead) => void;
}

function LeadTableRow({ lead, onViewDetails, onUpdateStatus }: LeadTableRowProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      BOUGHT: 'success',
      NEGOTIATION: 'warning',
      CANCELLED: 'danger',
    };

    const labels: Record<string, string> = {
      BOUGHT: 'Comprou',
      NEGOTIATION: 'Negociando',
      CANCELLED: 'Cancelado',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
        <div className="text-sm text-gray-500">{lead.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{lead.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {lead.owner?.name || 'Sem vendedor'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(lead.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{formatDate(lead.createdAt)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onViewDetails(lead)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Ver Detalhes"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateStatus(lead)}
          >
            Atualizar Status
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default memo(LeadTableRow);

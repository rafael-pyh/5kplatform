 'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils/cn';
import { Lead } from '@/lib/types';
import LeadTableRow from './LeadTableRow';
import EmptyState from '@/components/ui/EmptyState';

interface LeadTableProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
  onUpdateStatus: (lead: Lead) => void;
  className?: string;
}

function LeadTable({ leads, onViewDetails, onUpdateStatus, className }: LeadTableProps) {
  if (leads.length === 0) {
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
        title="Nenhum lead encontrado"
        description="Leads capturados através dos QR codes aparecerão aqui."
      />
    );
  }

  return (
    <div className={cn('overflow-x-auto w-full max-w-full', className)}>
      <table className="w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate"
            >
              Cliente
            </th>
            <th
              scope="col"
              className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate"
            >
              Telefone
            </th>
            <th
              scope="col"
              className="hidden md:table-cell p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate"
            >
              Vendedor
            </th>
            <th
              scope="col"
              className="hidden md:table-cell p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate"
            >
              Status
            </th>
            <th
              scope="col"
              className="hidden lg:table-cell p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate"
            >
              Data
            </th>
            <th
              scope="col"
              className="hidden lg:table-cell p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate"
            >
              Localização
            </th>
            <th scope="col" className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <LeadTableRow
              key={lead.id}
              lead={lead}
              onViewDetails={onViewDetails}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(LeadTable);

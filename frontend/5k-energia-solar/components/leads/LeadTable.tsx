 'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils/cn';
import { Lead } from '@/lib/types';
import LeadTableRow from './LeadTableRow';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '../ui';

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
    <div className={cn('w-full max-w-full', className)}>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
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
              <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            onClick={() => onViewDetails(lead)}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Name and Email */}
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900 truncate" title={lead.name}>
                {lead.name}
              </h3>
              <p className="text-xs text-gray-500 truncate" title={lead.email}>
                {lead.email}
              </p>
            </div>

            {/* Phone and Seller */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <p className="text-gray-500 font-medium mb-1">Telefone</p>
                <p className="text-gray-900 font-medium" title={lead.phone}>
                  {lead.phone || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Vendedor</p>
                <p className="text-gray-900 font-medium truncate" title={lead.owner?.name}>
                  {lead.owner?.name || 'Sem vendedor'}
                </p>
              </div>
            </div>

            {/* Status, Date and Location */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div>
                <p className="text-gray-500 font-medium mb-1">Status</p>
                <div>
                  {lead.status === 'BOUGHT' && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Comprou
                    </span>
                  )}
                  {lead.status === 'NEGOTIATION' && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Negociando
                    </span>
                  )}
                  {lead.status === 'CANCELLED' && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Cancelado
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Data</p>
                <p className="text-gray-900 font-medium">
                  {lead.createdAt
                    ? new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Local</p>
                <p className="text-gray-900 font-medium" title={`${lead.city}/${lead.state}`}>
                  {lead.city || '-'}/{lead.state || '-'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(lead);
                }}
                variant="outline-blue"
                className="flex-1 flex items-center justify-center gap-2 font-medium text-sm"
              >
                <svg
                  className="w-4 h-4"
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
                Detalhes
              </Button>
              <Button
                variant="outline-blue"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(lead);
                }}
                className="flex-1 flex items-center justify-center gap-2 font-medium text-sm"
              >
                Atualizar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(LeadTable);

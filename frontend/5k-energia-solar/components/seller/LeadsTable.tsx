"use client";

import React from 'react';

type Lead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
  commissionAmount?: number;
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    BOUGHT: { bg: 'bg-green-100', text: 'text-green-800', label: 'Comprou' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Não comprou' },
    NEGOTIATION: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Negociando' },
  };

  const config = statusConfig[status] || statusConfig.NEGOTIATION;
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>{config.label}</span>;
};

interface LeadsTableProps {
  leads: Lead[];
  userRole?: string;
}

const isSeller = (role?: string) => role === 'SELLER' || role === 'ADMIN' || role === 'SUPER_ADMIN';

const LeadsTable = ({ leads, userRole }: LeadsTableProps) => {
  const leadsArray: Lead[] = Array.isArray(leads)
    ? leads
    : Array.isArray((leads as any)?.data)
    ? (leads as any).data
    : Array.isArray((leads as any)?.rows)
    ? (leads as any).rows
    : [];

  if (!leadsArray || leadsArray.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum lead cadastrado ainda.</p>
      </div>
    );
  }

  const showFullData = isSeller(userRole);

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              {showFullData && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leadsArray.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                {showFullData && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone || lead.email || '-'}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(lead.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {Number(lead.commissionAmount || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {leadsArray.map((lead) => (
          <div key={lead.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{lead.name}</h3>
              {lead.email && <p className="text-xs text-gray-500 truncate">{lead.email}</p>}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {showFullData && lead.phone && (
                <div>
                  <p className="text-xs text-gray-500">Telefone</p>
                  <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(lead.status)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Comissão</p>
                <p className="text-sm font-medium text-gray-900">R$ {Number(lead.commissionAmount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data</p>
                <p className="text-sm font-medium text-gray-900">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default LeadsTable;

"use client";

import React from 'react';

type Lead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
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

const LeadsTable = ({ leads }: { leads: Lead[] }) => {
  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum lead cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {leads.map((lead) => (
          <tr key={lead.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone || lead.email || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(lead.status)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LeadsTable;

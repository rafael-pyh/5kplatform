'use client';

import { memo, useState } from 'react';
import { Lead } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import EmptyState from '@/components/ui/EmptyState';

interface RecentLeadsTableProps {
  leads?: Lead[];
  sellers?: { id: string; name: string; phone?: string; createdAt?: string }[];
}

function RecentLeadsTable({ leads = [], sellers = [] }: RecentLeadsTableProps) {
  const [active, setActive] = useState<'leads' | 'sellers'>('leads');
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

  const sanitize = (item: any) => ({
    id: item?.id ?? item?._id ?? 'unknown',
    name: item?.name ?? item?.fullName ?? item?.username ?? item?.email ?? '-',
    email: item?.email ?? '-',
    phone: item?.phone ?? item?.phoneNumber ?? '-',
    createdAt: item?.createdAt ?? item?.created_at ?? null,
  });

  const sanitizedLeads = (leads || []).map(sanitize);
  const sanitizedSellers = (sellers || []).map(sanitize);

  const totalLeads = sanitizedLeads.length;
  const totalSellers = sanitizedSellers.length;

  const currentItems = active === 'leads' ? sanitizedLeads : active === 'sellers' ? sanitizedSellers : [];

  if (!currentItems || currentItems.length === 0) {
    return (
      <Card padding="xs">
        <CardHeader>
          <CardTitle className="font-thin text-slate-700 ml-2">Últimos</CardTitle>
        </CardHeader>
        <CardContent>
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
            title="Nenhum item"
            description="Não há itens para exibir nesta aba."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card padding="xs">
      <CardHeader>
        <div className="w-full">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActive('leads')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  active === 'leads' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leads
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${active === 'leads' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-900'}`}>
                  {totalLeads}
                </span>
              </button>
              <button
                onClick={() => setActive('sellers')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  active === 'sellers' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vendedores
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${active === 'sellers' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-900'}`}>
                  {totalSellers}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className='bg-gray-50'>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name || '-'}</div>
                    {item.email && <div className="text-sm text-gray-500">{item.email}</div>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.phone || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(RecentLeadsTable);

'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminOrderCard } from '@/components/admin/shop/AdminOrderCard';
import { AdminWithdrawalCard } from '@/components/admin/shop/AdminWithdrawalCard';
import { useOrders } from '@/hooks/useOrders';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { OrderStatus } from '@/lib/types/shop.types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui';

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'Aguardando Pagamento',
  [OrderStatus.PENDING_APPROVAL]: 'Aguardando Aprovação',
  [OrderStatus.APPROVED]: 'Aprovado',
  [OrderStatus.REJECTED]: 'Rejeitado',
  [OrderStatus.PAID]: 'Pago',
};

export default function AdminShopPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'withdrawals'>('orders');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const ordersOptions = useMemo(() => ({ autoFetch: false }), []);
  const withdrawalsOptions = useMemo(() => ({ autoFetch: false }), []);
  const { orders, loading: ordersLoading, fetchOrders } = useOrders(ordersOptions);
  const { withdrawals, loading: withdrawalsLoading, fetchWithdrawals } = useWithdrawals(withdrawalsOptions);

  // Recarregar pedidos quando o filtro mudar
  useEffect(() => {
    fetchOrders({
      status: statusFilter === 'all' ? undefined : (statusFilter as OrderStatus),
    });
  }, [statusFilter, fetchOrders]);

  // Carregar saques quando a aba for selecionada
  useEffect(() => {
    if (activeTab === 'withdrawals') {
      fetchWithdrawals();
    }
  }, [activeTab, fetchWithdrawals]);

  const pendingOrders = useMemo(() => orders.filter((o) => o.status === OrderStatus.PENDING_APPROVAL), [orders]);
  const pendingWithdrawals = useMemo(() => withdrawals.filter((w) => w.status === 'PENDING'), [withdrawals]);

  const handleOrderActionSuccess = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleWithdrawalActionSuccess = useCallback(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="w-full">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-700">Gerenciamento de Shop</h1>
            <p className="text-gray-600">Aprove ou rejeite pedidos e processamento de saques</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <Button
              onClick={() => setActiveTab('orders')}
              variant='none'
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 rounded-none ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Pedidos
              {pendingOrders.length > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </Button>
            <Button
              onClick={() => setActiveTab('withdrawals')}
              variant='none'
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 rounded-none ${
                activeTab === 'withdrawals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Saques
              {pendingWithdrawals.length > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingWithdrawals.length}
                </span>
              )}
            </Button>
          </div>

          {/* Pedidos */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filtro */}
              <div className="flex gap-2 flex-wrap">
                {(['all', OrderStatus.PENDING_APPROVAL, OrderStatus.APPROVED, OrderStatus.REJECTED] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'outline-blue' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                    
                  >
                    {status === 'all' ? 'Todos' : statusLabels[status]}
                  </Button>
                ))}
              </div>

              {/* Orders */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg shadow col-span-full">
                    <p className="text-gray-600">Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <AdminOrderCard
                      key={order.id}
                      order={order}
                      onActionSuccess={handleOrderActionSuccess}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Saques */}
          {activeTab === 'withdrawals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {withdrawalsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg shadow">
                  <p className="text-gray-600">Nenhum saque pendente</p>
                </div>
              ) : (
                withdrawals.map((withdrawal) => (
                  <AdminWithdrawalCard
                    key={withdrawal.id}
                    withdrawal={withdrawal}
                    onActionSuccess={handleWithdrawalActionSuccess}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

'use client';

import DashboardLayout from '@/components/DashboardLayout';
import SellerDashboardLayout from '@/components/SellerDashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { OrderCard } from '@/components/shop/OrderCard';
import { CreditWalletCard } from '@/components/shop/CreditWalletCard';
import { TransactionList } from '@/components/shop/TransactionList';
import { useOrders } from '@/hooks/useOrders';
import { useCredits } from '@/hooks/useCredits';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { WithdrawalRequest } from '@/lib/types/shop.types';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils/dateUtils';

export default function MyOrdersPage() {
  const { orders, loading: ordersLoading, fetchOrders } = useOrders();
  const { stats, transactions, loading: creditsLoading, fetchTransactions } = useCredits();
  const { withdrawals, loading: withdrawalsLoading, fetchWithdrawals } = useWithdrawals({ autoFetch: false });
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'credits' | 'withdrawals'>('orders');

  const handleUploadSuccess = () => {
    fetchOrders();
  };

  const handleWithdrawalRequest = () => {
    fetchTransactions();
    fetchWithdrawals();
  };

  // Carregar withdrawals quando a aba for selecionada
  useEffect(() => {
    if (activeTab === 'withdrawals') {
      fetchWithdrawals();
    }
  }, [activeTab, fetchWithdrawals]);

  // Determinar qual layout usar baseado no tipo de usuário
  const isSellerOrAffiliate = user?.role === 'SELLER' || user?.role === 'AFFILIATE';
  const LayoutComponent = isSellerOrAffiliate ? SellerDashboardLayout : DashboardLayout;

  return (
    <ProtectedRoute allowedRoles={['SELLER', 'AFFILIATE', 'ADMIN', 'SUPER_ADMIN']}>
      <LayoutComponent>
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-700">Minha Conta</h1>
            <p className="text-gray-600">Visualize seus pedidos e gerecie seus créditos</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Meus Pedidos
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'credits'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Créditos
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'withdrawals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Saques
            </button>
          </div>

          {/* Pedidos */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg shadow">
                  <p className="text-gray-600">Nenhum pedido realizado ainda</p>
                  <a
                    href="/shop"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver Kits Disponíveis →
                  </a>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderCard key={order.id} order={order} onUploadSuccess={handleUploadSuccess} />
                ))
              )}
            </div>
          )}

          {/* Créditos */}
          {activeTab === 'credits' && (
            <div className="space-y-6">
              <CreditWalletCard stats={stats} onWithdrawalRequest={handleWithdrawalRequest} />

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Transações</h3>
                <TransactionList transactions={transactions} loading={creditsLoading} />
              </div>
            </div>
          )}

          {/* Saques */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Solicitações de Saque</h3>
                {withdrawalsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg shadow">
                    <p className="text-gray-600">Nenhuma solicitação de saque realizada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">💸</div>
                            <div>
                              <p className="font-medium text-gray-900">Solicitação de Saque</p>
                              <p className="text-xs text-gray-600">
                                {formatDate(withdrawal.createdAt)}
                              </p>
                              {withdrawal.notes && (
                                <p className="text-xs text-gray-500 mt-1">{withdrawal.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg text-red-600`}>
                              -R$ {Number(withdrawal.amount).toFixed(2)}
                            </p>
                            <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                              withdrawal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              withdrawal.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                              withdrawal.status === 'PAID' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {withdrawal.status === 'PENDING' ? 'Pendente' :
                               withdrawal.status === 'APPROVED' ? 'Aprovado' :
                               withdrawal.status === 'PAID' ? 'Pago' : 'Rejeitado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </LayoutComponent>
    </ProtectedRoute>
  );
}

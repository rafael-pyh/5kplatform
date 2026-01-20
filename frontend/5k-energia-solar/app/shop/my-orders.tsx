'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { OrderCard } from '@/components/shop/OrderCard';
import { CreditWalletCard } from '@/components/shop/CreditWalletCard';
import { TransactionList } from '@/components/shop/TransactionList';
import { useOrders } from '@/hooks/useOrders';
import { useCredits } from '@/hooks/useCredits';
import { useState } from 'react';

export default function MyOrdersPage() {
  const { orders, loading: ordersLoading, fetchOrders } = useOrders();
  const { stats, transactions, loading: creditsLoading, fetchTransactions } = useCredits();
  const [activeTab, setActiveTab] = useState<'orders' | 'credits'>('orders');

  const handleUploadSuccess = () => {
    fetchOrders();
  };

  const handleWithdrawalRequest = () => {
    fetchTransactions();
  };

  return (
    <ProtectedRoute allowedRoles={['SELLER', 'AFFILIATE', 'ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Minha Conta</h1>
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
                <div className="text-center py-12 bg-gray-50 rounded-lg">
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

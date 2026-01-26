'use client';

import DashboardLayout from '@/components/DashboardLayout';
import SellerDashboardLayout from '@/components/SellerDashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CreditWalletCard } from '@/components/shop/CreditWalletCard';
import { TransactionList } from '@/components/shop/TransactionList';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils/dateUtils';

export default function WithdrawalsPage() {
  const { withdrawals, loading: withdrawalsLoading, fetchWithdrawals } = useWithdrawals({ autoFetch: true });
  const { stats, transactions, loading: creditsLoading, fetchTransactions } = useCredits();
  const { user } = useAuth();

  const handleWithdrawalRequest = () => {
    fetchTransactions();
    fetchWithdrawals();
  };

  // Determinar qual layout usar baseado no tipo de usuário
  const isSellerOrAffiliate = user?.role === 'SELLER' || user?.role === 'AFFILIATE';
  const LayoutComponent = isSellerOrAffiliate ? SellerDashboardLayout : DashboardLayout;

  return (
    <ProtectedRoute allowedRoles={['SELLER', 'AFFILIATE', 'ADMIN', 'SUPER_ADMIN']}>
      <LayoutComponent>
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-700">Minha Carteira</h1>
            <p className="text-gray-600">Gerencie seus créditos e solicitações de saque</p>
          </div>

          {/* Créditos */}
          <div className="space-y-6 mb-8">
            <CreditWalletCard stats={stats} onWithdrawalRequest={handleWithdrawalRequest} />

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Transações</h3>
              <TransactionList transactions={transactions} loading={creditsLoading} />
            </div>
          </div>

          {/* Saques */}
          <div className="space-y-6">
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
      </LayoutComponent>
    </ProtectedRoute>
  );
}
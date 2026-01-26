'use client';

import DashboardLayout from '@/components/DashboardLayout';
import SellerDashboardLayout from '@/components/SellerDashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CreditWalletCard } from '@/components/shop/CreditWalletCard';
import { TransactionList } from '@/components/shop/TransactionList';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/contexts/AuthContext';

export default function WithdrawalsPage() {
  const { fetchWithdrawals } = useWithdrawals({ autoFetch: true });
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
        </div>
      </LayoutComponent>
    </ProtectedRoute>
  );
}
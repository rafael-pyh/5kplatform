'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatsCards from '@/components/seller/StatsCards';
import LeadsTable from '@/components/seller/LeadsTable';
import useSellerDashboard from '@/hooks/useSellerDashboard';
import SellerDashboardLayout from '@/components/SellerDashboardLayout';

export default function SellerDashboardPage() {
  const {
    loading,
    blockedReason,
    leads,
    stats,
    handleLogout,
    userRole,
  } = useSellerDashboard();

  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (blockedReason) {
      const message = blockedReason === 'pendingApproval' ? 'Sua conta está pendente de aprovação.' : blockedReason === 'unverified' ? 'E-mail de verificação necessário para acessar o dashboard.' : 'Sua conta está bloqueado. Entre em contato com o suporte.';
      toast.error(message, { duration: 1000 });
      setBlocked(true);
    } else {
      setBlocked(false);
    }
  }, [blockedReason]);

  console.log('[SellerDashboardPage] Rendered with leads count:', leads.length, 'stats:', stats);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  return (
    <SellerDashboardLayout>
      <div className="space-y-6">
        <StatsCards stats={stats} />

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Meus Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <LeadsTable leads={leads} userRole={userRole} />
          </div>
        </div>
      </div>
    </SellerDashboardLayout>
  );
}

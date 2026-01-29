'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import QRCodeModal from '@/components/QRCodeModal';
import SellerHeader from '@/components/seller/SellerHeader';
import StatsCards from '@/components/seller/StatsCards';
import LeadsTable from '@/components/seller/LeadsTable';
import useSellerDashboard from '@/hooks/useSellerDashboard';

export default function SellerDashboardPage() {
  const {
    loading,
    blockedReason,
    seller,
    leads,
    stats,
    isQRModalOpen,
    qrModalMode,
    openQRModal,
    openQRCodeModal,
    openCriativosModal,
    closeQRModal,
    handleLogout,
    userRole,
  } = useSellerDashboard();

  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (blockedReason) {
      const message = blockedReason === 'pendingApproval' ? 'Sua conta está pendente de aprovação.' : blockedReason === 'unverified' ? 'E-mail de verificação necessário para acessar o dashboard.' : 'Sua conta está bloqueada. Entre em contato com o suporte.';
      toast.error(message, { duration: 1000 });
      setBlocked(true);
    } else {
      setBlocked(false);
    }
  }, [blockedReason]);

  console.log('[SellerDashboardPage] Rendered with seller:', seller, 'leads count:', leads.length, 'stats:', stats);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader seller={seller} onOpenQR={openQRCodeModal} onOpenCriativos={openCriativosModal} onLogout={handleLogout} blocked={blocked} />

      <main className="w-full h-lvh mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-linear-to-br from-blue-50 to-green-50">
        <StatsCards stats={stats} />

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Meus Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <LeadsTable leads={leads} userRole={userRole} />
          </div>
        </div>
      </main>

      {seller?.qrCodeUrl && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={closeQRModal}
          qrCodeBase64={seller.qrCodeUrl}
          personName={seller.name}
          qrCode={seller.qrCode}
          userRole={userRole}
          initialMode={qrModalMode}
        />
      )}
    </div>
  );
}

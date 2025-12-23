'use client';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import QRCodeModal from '@/components/QRCodeModal';
import SellerHeader from '@/components/seller/SellerHeader';
import StatsCards from '@/components/seller/StatsCards';
import LeadsTable from '@/components/seller/LeadsTable';
import BlockedNotice from '@/components/seller/BlockedNotice';
import useSellerDashboard from '@/hooks/useSellerDashboard';

export default function SellerDashboardPage() {
  const {
    loading,
    blockedReason,
    seller,
    leads,
    stats,
    isQRModalOpen,
    openQRModal,
    closeQRModal,
    handleLogout,
    userRole,
  } = useSellerDashboard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (blockedReason) {
    return <BlockedNotice reason={blockedReason} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader seller={seller} onOpenQR={openQRModal} onLogout={handleLogout} />

      <main className="w-full h-lvh mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-linear-to-br from-blue-50 to-green-50">
        <StatsCards stats={stats} />

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Meus Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <LeadsTable leads={leads} />
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
        />
      )}
    </div>
  );
}

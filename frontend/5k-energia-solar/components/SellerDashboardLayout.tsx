'use client';

import { ReactNode } from 'react';
import SellerHeader from '@/components/seller/SellerHeader';
import { useSellerHeader } from '@/hooks/useSellerHeader';
import { cn } from '@/lib/utils/cn';
import QRCodeModal from '@/components/QRCodeModal';

interface SellerDashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function SellerDashboardLayout({ children, className }: SellerDashboardLayoutProps) {
  const { seller, onOpenQR, onOpenCriativos, onLogout, blocked, isQRModalOpen, qrModalMode, closeQRModal } = useSellerHeader();

  return (
    <div className={cn('flex flex-col min-h-[90vh] bg-gray-50', className)}>
      <SellerHeader
        seller={seller}
        onOpenQR={onOpenQR}
        onOpenCriativos={onOpenCriativos}
        onLogout={onLogout}
        blocked={blocked}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 bg-linear-to-br from-blue-50 to-green-50">{children}</main>

      {seller?.qrCodeUrl && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={closeQRModal}
          qrCodeBase64={seller.qrCodeUrl}
          personName={seller.name}
          qrCode={seller.qrCode}
          initialMode={qrModalMode}
        />
      )}
    </div>
  );
}
'use client';

import { ReactNode } from 'react';
import SellerHeader from '@/components/seller/SellerHeader';
import { useSellerHeader } from '@/hooks/useSellerHeader';
import { cn } from '@/lib/utils/cn';

interface SellerDashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function SellerDashboardLayout({ children, className }: SellerDashboardLayoutProps) {
  const { seller, onOpenQR, onLogout, blocked } = useSellerHeader();

  return (
    <div className={cn('flex flex-col min-h-[90vh] bg-gray-50', className)}>
      <SellerHeader
        seller={seller}
        onOpenQR={onOpenQR}
        onLogout={onLogout}
        blocked={blocked}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 bg-linear-to-br from-blue-50 to-green-50">{children}</main>
    </div>
  );
}
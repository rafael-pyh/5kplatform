'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils/cn';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn('flex flex-col min-h-screen bg-gray-50', className)}>
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 bg-linear-to-br from-blue-50 to-green-50">{children}</main>
    </div>
  );
}

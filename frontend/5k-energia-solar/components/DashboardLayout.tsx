'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils/cn';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn('flex min-h-screen bg-gray-50', className)}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}

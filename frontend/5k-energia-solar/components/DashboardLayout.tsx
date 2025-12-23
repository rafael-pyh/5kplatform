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
      <main className="flex-1 ml-4 pl-64 p-8 w-full min-w-0 bg-linear-to-br from-blue-50 to-green-50">{children}</main>
    </div>
  );
}

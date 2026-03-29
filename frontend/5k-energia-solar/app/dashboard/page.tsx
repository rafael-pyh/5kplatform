'use client';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DashboardLayout from '@/components/DashboardLayout';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RecentLeadsSection from '@/components/dashboard/RecentLeadsSection';
import useDashboard from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { loading, stats, recentLeads, persons, isAuthenticated, authLoading } = useDashboard();

  if (!isAuthenticated || loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-700">Dashboard</h1>
            <p className="text-gray-600 mt-1">Visão geral da plataforma</p>
          </div>
        </div>

        <StatsGrid stats={stats} />

        <RecentLeadsSection recentLeads={recentLeads} persons={persons} />
      </div>
    </DashboardLayout>
  );
}

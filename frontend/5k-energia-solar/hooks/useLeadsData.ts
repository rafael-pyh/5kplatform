'use client';

import { useDashboardContext } from '@/contexts/DashboardContext';

export function useLeadsData() {
  const { recentLeads, stats, loading, refreshData } = useDashboardContext();

  return {
    recentLeads,
    totalLeads: stats.totalLeads,
    newLeads: stats.newLeads,
    loading,
    refreshLeads: refreshData,
  };
}

'use client';

import { useDashboardContext } from '@/contexts/DashboardContext';

export function useLeadsData() {
  const { recentLeads, allLeads, stats, loading, refreshData } = useDashboardContext();

  return {
    recentLeads,
    allLeads,
    totalLeads: stats.totalLeads,
    newLeads: stats.newLeads,
    loading,
    refreshLeads: refreshData,
  };
}

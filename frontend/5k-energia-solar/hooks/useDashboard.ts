"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardContext } from '@/contexts/DashboardContext';
import { useGlobalRefresh } from '@/hooks/useGlobalRefresh';

interface DashboardStats {
  totalPersons: number;
  activePersons: number;
  totalLeads: number;
  newLeads: number;
}

export default function useDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { stats, recentLeads, persons, loading, loadDashboardData, refreshData } = useDashboardContext();

  // Usar o hook global de refresh com callback do dashboard
  const { isRefreshing } = useGlobalRefresh(async () => {
    await refreshData();
  });

  useEffect(() => {
    if (authLoading) return;
    
    // Redireciona AFILIATEs para seller dashboard
    if (user?.role === 'AFFILIATE') {
      router.push('/seller/dashboard');
      return;
    }
    
    if (!isAuthenticated) return;
  }, [isAuthenticated, authLoading, user?.role, router]);

  return {
    loading,
    stats,
    recentLeads,
    persons,
    loadDashboardData,
    isRefreshing,
    isAuthenticated,
    authLoading,
  };
}

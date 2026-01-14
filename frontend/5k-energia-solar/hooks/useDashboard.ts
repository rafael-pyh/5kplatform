"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { personService, leadService } from '@/lib/services';
import { getCachedData, setCacheData, clearDashboardCache } from '@/lib/cache';
import { toast } from 'react-hot-toast';
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

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ totalPersons: 0, activePersons: 0, totalLeads: 0, newLeads: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);

  // Cache keys
  const CACHE_KEYS = {
    stats: 'dashboard_stats',
    persons: 'dashboard_persons',
    recentLeads: 'dashboard_recent_leads',
  };

  // TTL: 15 minutes for stats and leads (balance between freshness and cost reduction)
  const CACHE_TTL_MS = 15 * 60 * 1000;

  const loadDashboardData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);

      // Try to load from cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedStats = getCachedData<DashboardStats>(CACHE_KEYS.stats);
        const cachedPersons = getCachedData<any[]>(CACHE_KEYS.persons);
        const cachedRecentLeads = getCachedData<any[]>(CACHE_KEYS.recentLeads);

        if (cachedStats && cachedPersons && cachedRecentLeads) {
          setStats(cachedStats);
          setPersons(cachedPersons);
          setRecentLeads(cachedRecentLeads);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data from API
      const [personsRes, allLeads, newLeads] = await Promise.all([
        personService.getAll(),
        leadService.getAll(),
        leadService.getNewLeads(),
      ]);

      const newStats: DashboardStats = {
        totalPersons: personsRes.length,
        activePersons: personsRes.filter((p: any) => p.active).length,
        totalLeads: allLeads.length,
        newLeads: newLeads.length,
      };

      // Cache the data
      setCacheData(CACHE_KEYS.stats, newStats, CACHE_TTL_MS);
      setCacheData(CACHE_KEYS.persons, personsRes, CACHE_TTL_MS);
      setCacheData(CACHE_KEYS.recentLeads, newLeads.slice(0, 5), CACHE_TTL_MS);

      // Update state
      setStats(newStats);
      setRecentLeads(newLeads.slice(0, 5));
      setPersons(personsRes);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status !== 401) {
        toast.error('Erro ao carregar dados do dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [CACHE_KEYS.stats, CACHE_KEYS.persons, CACHE_KEYS.recentLeads, CACHE_TTL_MS]);

  // Usar o hook global de refresh com callback do dashboard
  const { isRefreshing } = useGlobalRefresh(async () => {
    await loadDashboardData(true);
  });

  useEffect(() => {
    if (authLoading) return;
    
    // Redireciona AFILIATEs para seller dashboard
    if (user?.role === 'AFFILIATE') {
      router.push('/seller/dashboard');
      return;
    }
    
    if (!isAuthenticated) return;
    loadDashboardData();
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

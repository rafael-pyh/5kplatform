'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cachedPersonService, cachedLeadService } from '@/lib/services/cached';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalPersons: number;
  activePersons: number;
  totalLeads: number;
  newLeads: number;
}

interface DashboardContextType {
  // Data
  stats: DashboardStats;
  recentLeads: any[];
  allLeads: any[];
  persons: any[];
  
  // State
  loading: boolean;
  error: string | null;
  isAdminDashboard: boolean;
  
  // Actions
  loadDashboardData: (forceRefresh?: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalPersons: 0,
    activePersons: 0,
    totalLeads: 0,
    newLeads: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Verifica se é dashboard de admin
  const isAdminDashboard = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    // Só carrega dados de dashboard para ADMINs
    if (!isAdminDashboard) {
      setIsInitialized(true);
      return;
    }

    if (loading && !forceRefresh) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [personsRes, allLeadsRes, newLeads] = await Promise.all([
        cachedPersonService.getAll(),
        cachedLeadService.getAll(),
        cachedLeadService.getNewLeads(),
      ]);

      // Calculate stats
      const newStats: DashboardStats = {
        totalPersons: personsRes.length,
        activePersons: personsRes.filter((p: any) => p.active).length,
        totalLeads: allLeadsRes.length,
        newLeads: newLeads.length,
      };

      // Update state
      setStats(newStats);
      setPersons(personsRes);
      setAllLeads(allLeadsRes);
      setRecentLeads(newLeads.slice(0, 5));
      setIsInitialized(true);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      // Silently ignore 401 errors (unauthorized for non-admin users)
      if (err.response?.status !== 401) {
        setError('Erro ao carregar dados do dashboard');
      }
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [isAdminDashboard]);

  const refreshData = useCallback(async () => {
    await loadDashboardData(true);
  }, [loadDashboardData]);

  const clearCache = useCallback(() => {
    setStats({
      totalPersons: 0,
      activePersons: 0,
      totalLeads: 0,
      newLeads: 0,
    });
    setRecentLeads([]);
    setAllLeads([]);
    setPersons([]);
    setError(null);
  }, []);

  // Load data on mount and when user role changes
  useEffect(() => {
    // Aguarda até que o usuário esteja carregado
    if (!user) {
      return;
    }

    // Se não é admin, não carrega dados
    if (!isAdminDashboard) {
      setIsInitialized(true);
      return;
    }

    // Se já foi inicializado e é admin, carrega dados
    if (!isInitialized && isAdminDashboard) {
      loadDashboardData();
    }
  }, [user, isAdminDashboard, isInitialized, loadDashboardData]);

  const value: DashboardContextType = {
    stats,
    recentLeads,
    allLeads,
    persons,
    loading,
    error,
    isAdminDashboard,
    loadDashboardData,
    refreshData,
    clearCache,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within DashboardProvider');
  }
  return context;
}

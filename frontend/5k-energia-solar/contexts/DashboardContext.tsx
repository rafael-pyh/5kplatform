'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cachedPersonService, cachedLeadService } from '@/lib/services/cached';
import { toast } from 'react-hot-toast';

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
  persons: any[];
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  loadDashboardData: (forceRefresh?: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalPersons: 0,
    activePersons: 0,
    totalLeads: 0,
    newLeads: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [personsRes, allLeads, newLeads] = await Promise.all([
        cachedPersonService.getAll(),
        cachedLeadService.getAll(),
        cachedLeadService.getNewLeads(),
      ]);

      // Calculate stats
      const newStats: DashboardStats = {
        totalPersons: personsRes.length,
        activePersons: personsRes.filter((p: any) => p.active).length,
        totalLeads: allLeads.length,
        newLeads: newLeads.length,
      };

      // Update state
      setStats(newStats);
      setPersons(personsRes);
      setRecentLeads(newLeads.slice(0, 5));
      setIsInitialized(true);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      if (err.response?.status !== 401) {
        setError('Erro ao carregar dados do dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

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
    setPersons([]);
    setError(null);
  }, []);

  // Load data on mount
  useEffect(() => {
    if (!isInitialized) {
      loadDashboardData();
    }
  }, [isInitialized, loadDashboardData]);

  const value: DashboardContextType = {
    stats,
    recentLeads,
    persons,
    loading,
    error,
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

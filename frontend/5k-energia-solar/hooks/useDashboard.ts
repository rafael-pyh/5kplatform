"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { personService, leadService } from '@/lib/services';
import { toast } from 'react-hot-toast';

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

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [personsRes, allLeads, newLeads] = await Promise.all([personService.getAll(), leadService.getAll(), leadService.getNewLeads()]);

      setStats({
        totalPersons: personsRes.length,
        activePersons: personsRes.filter((p: any) => p.active).length,
        totalLeads: allLeads.length,
        newLeads: newLeads.length,
      });

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
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    // Redireciona AFILIATEs para seller dashboard
    if (user?.role === 'AFFILIATE') {
      router.push('/seller/dashboard');
      return;
    }
    
    if (!isAuthenticated) return;
    loadDashboardData();
  }, [isAuthenticated, authLoading, loadDashboardData, user?.role, router]);

  return {
    loading,
    stats,
    recentLeads,
    persons,
    loadDashboardData,
    isAuthenticated,
    authLoading,
  };
}

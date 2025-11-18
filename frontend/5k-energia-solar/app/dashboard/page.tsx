'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentLeadsTable from '@/components/dashboard/RecentLeadsTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { personService, leadService } from '@/lib/services';
import { Lead } from '@/lib/types';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalPersons: number;
  activePersons: number;
  totalLeads: number;
  newLeads: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPersons: 0,
    activePersons: 0,
    totalLeads: 0,
    newLeads: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [persons, allLeads, newLeads] = await Promise.all([
        personService.getAll(),
        leadService.getAll(),
        leadService.getNewLeads(),
      ]);

      setStats({
        totalPersons: persons.length,
        activePersons: persons.filter((p) => p.active).length,
        totalLeads: allLeads.length,
        newLeads: newLeads.length,
      });

      setRecentLeads(newLeads.slice(0, 5));
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      
      // Se não for erro 401, mostra o toast
      if (error.response?.status !== 401) {
        toast.error('Erro ao carregar dados do dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, router, loadDashboardData]);

  // Memoized stats cards configuration
  const statsCards = useMemo(
    () => [
      {
        title: 'Total de Vendedores',
        value: stats.totalPersons,
        icon: (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        iconBgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      {
        title: 'Vendedores Ativos',
        value: stats.activePersons,
        icon: (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        iconBgColor: 'bg-green-100',
        iconColor: 'text-green-600',
      },
      {
        title: 'Total de Leads',
        value: stats.totalLeads,
        icon: (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        iconBgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
      },
      {
        title: 'Novos Leads',
        value: stats.newLeads,
        icon: (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        ),
        iconBgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
      },
    ],
    [stats]
  );

  if (!isAuthenticated || loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral da plataforma</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <StatsCard key={index} {...card} />
          ))}
        </div>

        {/* Recent Leads */}
        <RecentLeadsTable leads={recentLeads} />
      </div>
    </DashboardLayout>
  );
}

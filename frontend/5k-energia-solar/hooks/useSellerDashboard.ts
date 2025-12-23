"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Lead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
};

type Stats = {
  total: number;
  bought: number;
  negotiation: number;
  cancelled: number;
  conversionRate: string;
} | null;

type Seller = any;

export default function useSellerDashboard() {
  const router = useRouter();
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [blockedReason, setBlockedReason] = useState<'unverified' | 'pendingApproval' | 'inactive' | null>(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  }, [router]);

  const openQRModal = useCallback(() => setIsQRModalOpen(true), []);
  const closeQRModal = useCallback(() => setIsQRModalOpen(false), []);

  const loadData = useCallback(
    async (latestUser?: any) => {
      try {
        setLoading(true);

        const currentUser = latestUser || user;
        if (!currentUser) {
          router.push('/login');
          return;
        }

        const profileRes = await api.get('/seller/profile');
        setSeller(profileRes.data.data);

        if (!currentUser.emailVerified) {
          setBlockedReason('unverified');
          return;
        }

        if (currentUser.approvalStatus !== 'approved') {
          setBlockedReason('pendingApproval');
          return;
        }

        if (currentUser.active === false) {
          setBlockedReason('inactive');
          return;
        }

        const [leadsRes, statsRes] = await Promise.all([api.get('/seller/my-leads'), api.get('/seller/my-stats')]);
        setLeads(leadsRes.data.data || []);
        setStats(statsRes.data.data || null);
        setBlockedReason(null);
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error('Sessão expirada ou acesso negado. Faça login novamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userType');
          router.push('/login');
        } else {
          toast.error('Erro ao carregar dados');
        }
      } finally {
        setLoading(false);
      }
    },
    [router, user]
  );

  useEffect(() => {
    const init = async () => {
      setBlockedReason(null);
      setLoading(true);
      if (authLoading) return;

      if (!user) {
        toast.error('Faça login novamente.');
        router.push('/login');
        return;
      }

      if (user.role?.toUpperCase() !== 'SELLER') {
        toast.error('Acesso negado. Faça login como vendedor.');
        router.push('/login');
        return;
      }

      const updatedUser = await refreshUser();
      await loadData(updatedUser);
    };

    init();
    // Intentionally only depend on authLoading to avoid re-running when user or loadData changes
  }, [authLoading]);

  return {
    loading,
    blockedReason,
    seller,
    leads,
    stats,
    isQRModalOpen,
    openQRModal,
    closeQRModal,
    handleLogout,
    userRole: user?.role as 'SELLER' | 'ADMIN' | 'SUPER_ADMIN' | undefined,
  };
}

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
  commissionAmount?: number;
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
  const [qrModalMode, setQrModalMode] = useState<'qr' | 'criativos' | 'poster'>('qr');
  const [blockedReason, setBlockedReason] = useState<'unverified' | 'pendingApproval' | 'inactive' | null>(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  }, [router]);

  const openQRModal = useCallback((mode: 'qr' | 'criativos' | 'poster' = 'qr') => {
    setQrModalMode(mode);
    setIsQRModalOpen(true);
  }, []);
  const closeQRModal = useCallback(() => setIsQRModalOpen(false), []);

  const openQRCodeModal = useCallback(() => openQRModal('qr'), [openQRModal]);
  const openCriativosModal = useCallback(() => openQRModal('criativos'), [openQRModal]);

  const loadData = useCallback(
    async (latestUser?: any) => {
      try {
        setLoading(true);

        const currentUser = latestUser || user;
        if (!currentUser) {
          router.push('/login');
          return;
        }

        // AFFILIATE não precisa de profile e stats
        const userRoleUpper = currentUser.role?.toUpperCase();
        if (userRoleUpper === 'AFFILIATE') {
          const leadsRes = await api.get('/lead/my-leads');
          setLeads(leadsRes.data.data || []);
          setBlockedReason(null);
          return;
        }

        try {
          const profileRes = await api.get('/seller/profile');
          setSeller(profileRes.data.data);
        } catch (profileError: any) {
          console.error('Erro ao buscar profile do seller:', profileError);
          // Se o profile falhar, tenta continuar para carregar pelo menos os leads
          setSeller(null);
        }

        if (currentUser.active === false) {
          setBlockedReason('inactive');
          return;
        }

        try {
          const [leadsRes, statsRes] = await Promise.all([api.get('/lead/my-leads'), api.get('/seller/my-stats')]);
          
          // Debug logs
          console.log('[useSellerDashboard] Leads response:', leadsRes.data);
          console.log('[useSellerDashboard] Stats response:', statsRes.data);
          
          setLeads(leadsRes.data.data || []);
          
          // Stats validation - ensure it's a proper object
          const statsData = statsRes.data?.data;
          if (statsData && typeof statsData === 'object') {
            setStats(statsData);
          } else {
            console.warn('[useSellerDashboard] Invalid stats data received:', statsData);
            setStats(null);
          }
        } catch (dataError: any) {
          console.error('Erro ao carregar leads/stats:', dataError);
          console.error('Error details:', {
            status: dataError.response?.status,
            data: dataError.response?.data,
            message: dataError.message,
          });
          // Fallback para dados vazios se as requisições falharem
          setLeads([]);
          setStats(null);
        }
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

      if (user.role?.toUpperCase() !== 'SELLER' && user.role?.toUpperCase() !== 'AFFILIATE') {
        toast.error('Acesso negado. Faça login como vendedor ou afiliado.');
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
    qrModalMode,
    openQRModal,
    openQRCodeModal,
    openCriativosModal,
    closeQRModal,
    handleLogout,
    userRole: user?.role as 'SELLER' | 'ADMIN' | 'SUPER_ADMIN' | undefined,
  };
}

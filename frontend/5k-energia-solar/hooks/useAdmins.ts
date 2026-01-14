"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cachedAdminService } from '@/lib/services/cached';
import { toast } from 'react-hot-toast';
import { User } from '@/lib/types';

export default function useAdmins() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<User[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cachedAdminService.getAll();
      setAdmins(data);
    } catch (error: any) {
      console.error('Error loading admins:', error);
      if (error.response?.status !== 401) {
        toast.error('Erro ao carregar administradores');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return; // wait until auth is loaded

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      toast.error('Você não tem permissão para acessar esta página');
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      loadAdmins();
    }
  }, [isAuthenticated, user, loadAdmins]);

  const openNewModal = useCallback(() => setIsNewModalOpen(true), []);
  const closeNewModal = useCallback(() => setIsNewModalOpen(false), []);

  const openEditModal = useCallback((admin: User) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  }, []);
  const closeEditModal = useCallback(() => {
    setSelectedAdmin(null);
    setIsEditModalOpen(false);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Tem certeza que deseja excluir este administrador?')) return;
      try {
        await cachedAdminService.delete(id);
        toast.success('Administrador excluído com sucesso!');
        await loadAdmins();
      } catch (error: any) {
        console.error('Error deleting admin:', error);
        toast.error(error.response?.data?.message || 'Erro ao excluir administrador');
      }
    },
    [loadAdmins]
  );

  const handleSuccess = useCallback(() => {
    loadAdmins();
  }, [loadAdmins]);

  return {
    loading,
    admins,
    isNewModalOpen,
    isEditModalOpen,
    selectedAdmin,
    openNewModal,
    closeNewModal,
    openEditModal,
    closeEditModal,
    handleDelete,
    handleSuccess,
    loadAdmins,
    // expose auth helpers for page guards
    user,
    isAuthenticated,
    authLoading,
  };
}

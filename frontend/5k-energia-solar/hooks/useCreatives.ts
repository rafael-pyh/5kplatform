"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type Creative = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  type: string;
  tags?: string;
  downloadCount: number;
  uploadedBy?: { id: string; name: string };
  createdAt: string;
};

export default function useCreatives() {
  const router = useRouter();
  const { user } = useAuth();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCreatives = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/creatives?limit=100');
      setCreatives(response.data.data.criativos || []);
    } catch (error) {
      console.error('Erro ao carregar criativos:', error);
      toast.error('Erro ao carregar criativos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadCreatives();
  }, [loadCreatives]);

  const handleDeleteCreative = useCallback(
    async (creativeId: string) => {
      if (!confirm('Tem certeza que deseja deletar este criativo?')) return;

      try {
        await api.delete(`/creatives/${creativeId}`);
        toast.success('Criativo deletado com sucesso');
        await loadCreatives();
      } catch (error: any) {
        console.error('Erro ao deletar criativo:', error);
        const errorMsg = error.response?.data?.message || 'Erro ao deletar criativo';
        toast.error(errorMsg);
      }
    },
    [loadCreatives]
  );

  const handleCreativeUploaded = useCallback(() => {
    loadCreatives();
  }, [loadCreatives]);

  return {
    creatives,
    loading,
    loadCreatives,
    handleDeleteCreative,
    handleCreativeUploaded,
    user,
  };
}

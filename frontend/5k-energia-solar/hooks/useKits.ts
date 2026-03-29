'use client';

import { useCallback, useEffect, useState } from 'react';
import { Kit } from '@/lib/types/shop.types';
import { shopService } from '@/lib/services/shop.service';

interface UseKitsReturn {
  kits: Kit[];
  loading: boolean;
  error: string | null;
  fetchKits: () => Promise<void>;
  getKitById: (id: string) => Kit | undefined;
}

export function useKits(): UseKitsReturn {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shopService.kits.getAll();
      setKits(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar kits');
      console.error('Erro em useKits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getKitById = useCallback(
    (id: string) => {
      return kits.find((k) => k.id === id);
    },
    [kits]
  );

  useEffect(() => {
    fetchKits();
  }, [fetchKits]);

  return {
    kits,
    loading,
    error,
    fetchKits,
    getKitById,
  };
}

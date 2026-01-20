'use client';

import { useState, useCallback, useEffect } from 'react';
import { shopService } from '@/lib/services/shop.service';
import { Kit, Order, CreditStats, WithdrawalRequest } from '@/lib/types/shop.types';

interface UseShopState {
  kits: Kit[];
  loading: boolean;
  error: string | null;
}

export function useShop() {
  const [state, setState] = useState<UseShopState>({
    kits: [],
    loading: false,
    error: null,
  });

  const fetchKits = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const kits = await shopService.kits.getAll();
      setState((prev) => ({ ...prev, kits, loading: false }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar kits',
        loading: false,
      }));
    }
  }, []);

  const getKitById = useCallback(async (id: string) => {
    try {
      return await shopService.kits.getById(id);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar kit',
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    fetchKits();
  }, [fetchKits]);

  return {
    kits: state.kits,
    loading: state.loading,
    error: state.error,
    fetchKits,
    getKitById,
  };
}

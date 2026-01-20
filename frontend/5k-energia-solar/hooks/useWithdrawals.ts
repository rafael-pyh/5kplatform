'use client';

import { useState, useCallback, useEffect } from 'react';
import { shopService } from '@/lib/services/shop.service';
import { WithdrawalRequest } from '@/lib/types/shop.types';

interface UseWithdrawalsState {
  withdrawals: WithdrawalRequest[];
  total: number;
  loading: boolean;
  error: string | null;
}

interface UseWithdrawalsOptions {
  autoFetch?: boolean;
}

export function useWithdrawals(options?: UseWithdrawalsOptions) {
  const [state, setState] = useState<UseWithdrawalsState>({
    withdrawals: [],
    total: 0,
    loading: false,
    error: null,
  });

  const fetchWithdrawals = useCallback(async (limit = 50, offset = 0) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await shopService.withdrawals.getAll(limit, offset);
      setState((prev) => ({
        ...prev,
        withdrawals: result.data,
        total: result.pagination.total,
        loading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar saques',
        loading: false,
      }));
    }
  }, []);

  const getWithdrawalById = useCallback(async (id: string) => {
    try {
      return await shopService.withdrawals.getById(id);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar saque',
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchWithdrawals();
    }
  }, []); // Removido fetchWithdrawals das dependências para evitar loops

  return {
    withdrawals: state.withdrawals,
    total: state.total,
    loading: state.loading,
    error: state.error,
    fetchWithdrawals,
    getWithdrawalById,
  };
}

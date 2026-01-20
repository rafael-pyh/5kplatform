'use client';

import { useState, useCallback, useEffect } from 'react';
import { shopService } from '@/lib/services/shop.service';
import { CreditTransaction, CreditStats } from '@/lib/types/shop.types';

interface UseCreditsState {
  balance: number;
  stats: CreditStats | null;
  transactions: CreditTransaction[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function useCredits() {
  const [state, setState] = useState<UseCreditsState>({
    balance: 0,
    stats: null,
    transactions: [],
    total: 0,
    loading: false,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    try {
      const balance = await shopService.credits.getBalance();
      setState((prev) => ({ ...prev, balance }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar saldo',
      }));
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const stats = await shopService.credits.getStats();
      setState((prev) => ({ ...prev, stats, loading: false }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar estatísticas',
        loading: false,
      }));
    }
  }, []);

  const fetchTransactions = useCallback(async (limit = 50, offset = 0) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await shopService.credits.getTransactions(limit, offset);
      setState((prev) => ({
        ...prev,
        transactions: result.data,
        total: result.pagination.total,
        loading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar transações',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchStats();
    fetchTransactions();
  }, [fetchBalance, fetchStats, fetchTransactions]);

  return {
    balance: state.balance,
    stats: state.stats,
    transactions: state.transactions,
    total: state.total,
    loading: state.loading,
    error: state.error,
    fetchBalance,
    fetchStats,
    fetchTransactions,
  };
}

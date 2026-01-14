"use client";

import { useCallback, useState } from 'react';
import { clearDashboardCache } from '@/lib/cache';
import { toast } from 'react-hot-toast';

/**
 * Hook para gerenciar o estado de refresh global
 * Pode ser usado em qualquer página/componente
 * 
 * @param onRefresh - Callback opcional executado durante refresh
 * @returns {object} { handleRefresh, isRefreshing }
 */
export function useGlobalRefresh(onRefresh?: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);

      // Limpa cache do dashboard
      clearDashboardCache();

      // Se uma função de refresh foi passada, executa
      if (onRefresh) {
        await onRefresh();
      }

      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Error during refresh:', error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh]);

  return {
    handleRefresh,
    isRefreshing,
  };
}

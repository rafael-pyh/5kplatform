"use client";

import { useCallback, useState } from 'react';
import { clearDashboardCache } from '@/lib/cache';
import { toast } from 'react-hot-toast';

/**
 * Hook para gerenciar o estado de refresh global
 * Pode ser usado em qualquer página/componente
 * Limpa o cache de dados mantendo o usuário logado (como Ctrl+Shift+R)
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

      // Limpa apenas o cache de dados (mantém autenticação intacta)
      clearDashboardCache();

      // Aguarda um pouco para garantir limpeza
      await new Promise(resolve => setTimeout(resolve, 100));

      // Se uma função de refresh foi passada, executa
      if (onRefresh) {
        await onRefresh();
      }

      // Força o navegador a revalidar com o servidor sem fazer reload
      // Isso pula o cache HTTP e força requisições novas
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        } catch (error) {
          console.warn('Error clearing service worker cache:', error);
        }
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

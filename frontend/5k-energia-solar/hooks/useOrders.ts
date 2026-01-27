'use client';

import { useState, useCallback, useEffect } from 'react';
import { shopService } from '@/lib/services/shop.service';
import { Order, OrderStatus } from '@/lib/types/shop.types';

interface UseOrdersState {
  orders: Order[];
  total: number;
  loading: boolean;
  error: string | null;
}

interface UseOrdersOptions {
  limit?: number;
  offset?: number;
  status?: OrderStatus;
  autoFetch?: boolean;
}

export function useOrders(options?: UseOrdersOptions) {
  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    total: 0,
    loading: false,
    error: null,
  });

  const fetchOrders = useCallback(
    async (opts?: UseOrdersOptions) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const finalOpts = { ...(options || {}), ...opts };
        console.debug('[useOrders] Fetching with options:', finalOpts);
        const result = await shopService.orders.getAll(
          finalOpts.limit || 50,
          finalOpts.offset || 0,
          {
            status: finalOpts.status,
          }
        );
        console.debug('[useOrders] Fetch complete, got', result.data.length, 'orders');
        setState((prev) => ({
          ...prev,
          orders: result.data,
          total: result.pagination.total,
          loading: false,
        }));
      } catch (error: any) {
        console.error('[useOrders] Error:', error);
        setState((prev) => ({
          ...prev,
          error: error.message || 'Erro ao carregar pedidos',
          loading: false,
        }));
      }
    },
    [] // Empty array - don't depend on options since we merge it dynamically
  );

  const getOrderById = useCallback(async (id: string) => {
    try {
      return await shopService.orders.getById(id);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar pedido',
      }));
      return null;
    }
  }, []);

  const getOrderByCode = useCallback(async (code: string) => {
    try {
      return await shopService.orders.getByCode(code);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar pedido',
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchOrders();
    }
  }, []); // Removido fetchOrders e options das dependências para evitar loops

  return {
    orders: state.orders,
    total: state.total,
    loading: state.loading,
    error: state.error,
    fetchOrders,
    getOrderById,
    getOrderByCode,
  };
}

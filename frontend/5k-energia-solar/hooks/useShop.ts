'use client';

import { useState, useCallback, useEffect } from 'react';
import { shopService } from '@/lib/services/shop.service';
import { Kit, Product, Order, CreditStats, WithdrawalRequest } from '@/lib/types/shop.types';

interface UseShopState {
  kits: Kit[];
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useShop() {
  const [state, setState] = useState<UseShopState>({
    kits: [],
    products: [],
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

  const fetchProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const products = await shopService.products.getAll();
      setState((prev) => ({ ...prev, products, loading: false }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar produtos',
        loading: false,
      }));
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [kits, products] = await Promise.all([
        shopService.kits.getAll(),
        shopService.products.getAll(),
      ]);
      setState((prev) => ({ ...prev, kits, products, loading: false }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar dados da loja',
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

  const getProductById = useCallback(async (id: string) => {
    try {
      return await shopService.products.getById(id);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao carregar produto',
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    kits: state.kits,
    products: state.products,
    loading: state.loading,
    error: state.error,
    fetchKits,
    fetchProducts,
    fetchAll,
    getKitById,
    getProductById,
  };
}

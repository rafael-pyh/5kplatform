'use client';

import { useCallback, useEffect, useState } from 'react';
import { Product } from '@/lib/types/shop.types';
import { shopService } from '@/lib/services/shop.service';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shopService.products.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar produtos');
      console.error('Erro em useProducts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProductById,
  };
}

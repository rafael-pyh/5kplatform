/**
 * API Cache Wrapper
 * Desabilitado: Usar DashboardContext para cache em memória
 * Este arquivo mantido apenas para compatibilidade
 */

import { getCachedData, setCacheData } from './cache';

interface CacheOptions {
  ttlMs?: number;
  key?: string;
}

/**
 * Cache a Promise (typically an API call)
 * @param cacheKey - Unique cache key for this request
 * @param fetchFn - Async function that fetches the data
 * @param options - Cache options (ttlMs, key)
 * @returns Cached or fresh data
 */
export async function cacheApiCall<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Desabilitado: Cache localStorage desabilitado, usar DashboardContext
  // Apenas executa a função sem cache
  return await fetchFn();
}


/**
 * Create a cached wrapper for a service method
 * @param cacheKey - Unique cache key
 * @param serviceFn - Service function to wrap
 * @param ttlMs - Time to live in milliseconds
 * @returns Wrapped function with caching
 */
export function createCachedMethod<T, Args extends any[]>(
  cacheKey: string,
  serviceFn: (...args: Args) => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
) {
  return async (...args: Args): Promise<T> => {
    // Desabilitado: Cache localStorage desabilitado
    return serviceFn(...args);
  };
}

/**
 * Batch cache multiple API calls
 * Useful for loading multiple resources at once
 */
export async function cacheBatchApiCalls<T extends Record<string, unknown>>(
  calls: Record<keyof T, { cacheKey: string; fn: () => Promise<any>; ttlMs?: number }>
): Promise<T> {
  const results = {} as T;

  for (const [key, config] of Object.entries(calls)) {
    try {
      results[key as keyof T] = await config.fn();
    } catch (error) {
      throw error;
    }
  }

  return results;
}

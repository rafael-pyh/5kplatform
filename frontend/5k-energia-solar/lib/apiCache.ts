/**
 * API Cache Wrapper
 * Wraps API calls with automatic caching
 * Reduces API calls and bandwidth usage
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
  const { ttlMs = 5 * 60 * 1000 } = options;

  // Try to get from cache first
  const cached = getCachedData<T>(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] ${cacheKey}`);
    return cached;
  }

  // Fetch fresh data
  console.log(`[Cache Miss] ${cacheKey} - Fetching from API`);
  const data = await fetchFn();

  // Cache the result
  setCacheData(cacheKey, data, ttlMs);

  return data;
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
    // Build cache key with arguments
    const fullKey = args.length > 0 
      ? `${cacheKey}_${JSON.stringify(args)}` 
      : cacheKey;

    return cacheApiCall(
      fullKey,
      () => serviceFn(...args),
      { ttlMs }
    );
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
      results[key as keyof T] = await cacheApiCall(
        config.cacheKey,
        config.fn,
        { ttlMs: config.ttlMs }
      );
    } catch (error) {
      console.error(`Error caching ${config.cacheKey}:`, error);
      throw error;
    }
  }

  return results;
}

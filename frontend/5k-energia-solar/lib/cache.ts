/**
 * Cache utilities with TTL support
 * Stores data in localStorage with expiration times
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Get cached data if it exists and hasn't expired
 * @param key - Cache key
 * @returns Cached data or null if expired/not found
 */
export function getCachedData<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const cacheItem: CacheItem<T> = JSON.parse(item);
    const now = Date.now();
    
    // Check if cache has expired
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error(`Error reading cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Set cache data with TTL
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttlMs - Time to live in milliseconds (default: 5 minutes)
 */
export function setCacheData<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
}

/**
 * Clear specific cache entry
 * @param key - Cache key
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing cache for key ${key}:`, error);
  }
}

/**
 * Clear all dashboard cache
 */
export function clearDashboardCache(): void {
  clearCache('dashboard_stats');
  clearCache('dashboard_persons');
  clearCache('dashboard_recent_leads');
}

/**
 * Check if cache is still valid (not expired)
 * @param key - Cache key
 * @returns true if cache exists and is valid
 */
export function isCacheValid(key: string): boolean {
  try {
    const item = localStorage.getItem(key);
    if (!item) return false;

    const cacheItem: CacheItem<any> = JSON.parse(item);
    const now = Date.now();
    
    return now - cacheItem.timestamp <= cacheItem.ttl;
  } catch {
    return false;
  }
}

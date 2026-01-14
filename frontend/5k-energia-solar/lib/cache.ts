/**
 * Cache utilities with TTL support and quota management
 * Stores data in localStorage with expiration times
 * Handles large data by limiting storage and auto-cleanup
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
}

// Max size per item: 500KB
const MAX_ITEM_SIZE = 500 * 1024;
// Max total cache size: 2MB
const MAX_TOTAL_CACHE = 2 * 1024 * 1024;

/**
 * Calculate size of object in bytes
 */
function estimateSize(obj: any): number {
  return new Blob([JSON.stringify(obj)]).size;
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
 * Clean up oldest cached items when quota is exceeded
 */
function cleanupOldestCache(): void {
  try {
    const allKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('cache_') || key.includes('dashboard_') || key.includes('persons') || key.includes('leads')
    );
    
    // Get all cache items with their timestamps
    const cacheItems = allKeys
      .map(key => {
        try {
          const item = localStorage.getItem(key);
          if (!item) return null;
          const parsed = JSON.parse(item);
          return { key, timestamp: parsed.timestamp || 0 };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));
    
    // Remove oldest items until we have space
    for (const item of cacheItems.slice(0, Math.ceil(cacheItems.length * 0.3))) {
      if (item?.key) {
        localStorage.removeItem(item.key);
      }
    }
  } catch (error) {
    console.error('Error during cache cleanup:', error);
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
    const size = estimateSize(data);
    
    // Skip caching if data is too large
    if (size > MAX_ITEM_SIZE) {
      console.warn(`Data for key ${key} is too large (${(size / 1024).toFixed(2)}KB), skipping cache`);
      return;
    }

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      size,
    };

    try {
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (e: any) {
      // If quota exceeded, cleanup and retry
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn('Cache quota exceeded, cleaning up old items...');
        cleanupOldestCache();
        
        // Try again after cleanup
        try {
          localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (retryError) {
          console.error(`Failed to cache ${key} even after cleanup:`, retryError);
        }
      } else {
        throw e;
      }
    }
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
  
  // Clear all api cache
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.startsWith('api_cache_')
  );
  keysToRemove.forEach(key => localStorage.removeItem(key));
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

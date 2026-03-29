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

// Max size per item: 10MB (increased for large datasets like persons list)
const MAX_ITEM_SIZE = 10 * 1024 * 1024;
// Max total cache size: 20MB
const MAX_TOTAL_CACHE = 20 * 1024 * 1024;

/**
 * Check if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Calculate size of object in bytes
 */
function estimateSize(obj: any): number {
  if (!isBrowser()) return 0;
  try {
    return new Blob([JSON.stringify(obj)]).size;
  } catch {
    return JSON.stringify(obj).length * 2; // fallback: rough estimate
  }
}

/**
 * Get cached data if it exists and hasn't expired
 * @param key - Cache key
 * @returns Cached data or null if expired/not found
 */
export function getCachedData<T>(key: string): T | null {
  if (!isBrowser()) return null;
  
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
  if (!isBrowser()) return;
  
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
  if (!isBrowser()) return;
  
  try {
    const size = estimateSize(data);
    
    // Skip caching if data is too large
    if (size > MAX_ITEM_SIZE) {
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
        cleanupOldestCache();
        
        // Try again after cleanup
        try {
          localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (retryError) {
          // Silently fail after cleanup attempt
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
  if (!isBrowser()) return;
  
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
  if (!isBrowser()) return;
  
  clearCache('dashboard_stats');
  clearCache('dashboard_persons');
  clearCache('dashboard_recent_leads');
  
  // Clear all api cache and related data
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.startsWith('api_cache_') ||
    key.startsWith('cache_') ||
    key.includes('dashboard_') ||
    key.includes('persons') ||
    key.includes('leads') ||
    key.includes('sellers') ||
    key.includes('admins') ||
    key.includes('creatives')
  );
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Clear all cache from all storage mechanisms (except auth data)
 * Limpa cache de dados mas mantém autenticação intacta (como Ctrl+Shift+R)
 * 
 * Mantém:
 * - Auth tokens e dados de login
 * - Informações de usuário
 * - Configurações persistidas
 * 
 * Limpa:
 * - Cache de API
 * - Cache de dashboard
 * - Cache de dados de leads, vendedores, etc
 * - IndexedDB
 * - Service Worker cache
 */
export function clearAllCache(): void {
  if (!isBrowser()) return;
  
  try {
    // Lista de chaves que devem ser mantidas (autenticação e configuração)
    const keysToPreserve = [
      'auth_token',
      'refresh_token',
      'user_id',
      'user_email',
      'user_name',
      'user_role',
      'user_photo',
      'localStorage_auth',
      'persist:auth', // Para Redux Persist
    ];
    
    // Preserva dados de autenticação
    const preservedData: Record<string, any> = {};
    keysToPreserve.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        preservedData[key] = value;
      }
    });
    
    // Também preserva chaves que começam com auth
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('auth')) {
        preservedData[key] = localStorage.getItem(key);
      }
    });
    
    // Limpa localStorage completamente
    localStorage.clear();
    
    // Restaura apenas dados de autenticação
    Object.entries(preservedData).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(key, value as string);
      }
    });
    
    // Limpa sessionStorage (exceto dados críticos)
    const sessionKeysToPreserve: Record<string, any> = {};
    Object.keys(sessionStorage).forEach(key => {
      if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
        sessionKeysToPreserve[key] = sessionStorage.getItem(key);
      }
    });
    sessionStorage.clear();
    Object.entries(sessionKeysToPreserve).forEach(([key, value]) => {
      if (value) {
        sessionStorage.setItem(key, value as string);
      }
    });
    
    // Limpa IndexedDB (usado pelo Next.js/React Query)
    if ('indexedDB' in window) {
      const databases = ['next-router-cache', 'next-app-cache'];
      
      for (const dbName of databases) {
        try {
          const request = indexedDB.deleteDatabase(dbName);
          request.onerror = () => console.warn(`Failed to delete IndexedDB: ${dbName}`);
        } catch (error) {
          console.warn(`Error deleting IndexedDB ${dbName}:`, error);
        }
      }
    }
    
    // Limpa cache do Service Worker (se existir)
    if ('serviceWorker' in navigator && 'caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName).catch(() => {});
        });
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

/**
 * Check if cache is still valid (not expired)
 * @param key - Cache key
 * @returns true if cache exists and is valid
 */
export function isCacheValid(key: string): boolean {
  if (!isBrowser()) return false;
  
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

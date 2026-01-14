/**
 * Serviço de Cache em Memória com Suporte a LRU e TTL
 * Utiliza Map nativo do JavaScript (sem dependências externas)
 * 
 * Características:
 * - TTL (Time To Live) configurável por chave
 * - LRU (Least Recently Used) automático quando limite é atingido
 * - Invalidação manual de cache
 * - Limpeza automática de itens expirados
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
  lastAccessed: number;
}

export interface CacheConfig {
  maxSize?: number;        // Máximo de itens em cache (default: 1000)
  defaultTTL?: number;     // TTL padrão em ms (default: 5 minutos)
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: CacheConfig = {}) {
    this.maxSize = config.maxSize || 1000;
    this.defaultTTL = config.defaultTTL || 5 * 60 * 1000; // 5 minutos

    // Inicia limpeza automática a cada 1 minuto
    this.startCleanupInterval();
  }

  /**
   * Obtém valor do cache
   */
  get<T>(key: string): T | null {
    this.cleanExpired(key);

    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    // Verifica se expirou
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    // Atualiza tempo de acesso (para LRU)
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  /**
   * Define valor no cache com TTL opcional
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    // Remove se já existe (para reorganizar)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Se atingiu limite de tamanho, remove o menos recentemente usado
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : Date.now() + this.defaultTTL,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * Remove chave específica do cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalida múltiplas chaves por padrão (regex)
   */
  invalidateByPattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: ((this.cache.size / this.maxSize) * 100).toFixed(2),
    };
  }

  /**
   * Remove o item menos recentemente usado (LRU)
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let lruKey: string | null = null;
    let lruTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Remove itens expirados (limpeza em tempo real)
   */
  private cleanExpired(key?: string): void {
    const keysToCheck = key ? [key] : Array.from(this.cache.keys());

    for (const k of keysToCheck) {
      const entry = this.cache.get(k);
      if (entry && entry.expiresAt && entry.expiresAt < Date.now()) {
        this.cache.delete(k);
      }
    }
  }

  /**
   * Inicia limpeza automática de itens expirados
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanExpired();
    }, 60 * 1000); // A cada 1 minuto

    // Permite que a aplicação termine mesmo com este interval ativo
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Para a limpeza automática
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Instância singleton do cache global
const globalCache = new CacheService({
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
  defaultTTL: parseInt(process.env.CACHE_TTL_MS || '300000'), // 5 minutos
});

/**
 * Factory para criar instâncias de cache específicas por contexto
 */
export function createCache(config?: CacheConfig): CacheService {
  return new CacheService(config);
}

/**
 * Retorna a instância global de cache
 */
export function getGlobalCache(): CacheService {
  return globalCache;
}

export default globalCache;

import { getGlobalCache } from './cache.service';

/**
 * Decorator para cachear resultado de métodos automaticamente
 * 
 * @param ttlMs - TTL em milissegundos (default: 5 minutos)
 * @param keyPrefix - Prefixo para a chave de cache
 * 
 * Exemplo:
 * @CacheDecorator(60000, 'users')
 * async getUser(id: string) { ... }
 */
export function CacheDecorator(ttlMs?: number, keyPrefix?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = getGlobalCache();
      const cacheKey = buildCacheKey(keyPrefix || propertyKey, args);

      // Tenta obter do cache
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        console.log(`[CACHE HIT] ${cacheKey}`);
        return cached;
      }

      // Se não está em cache, executa a função original
      console.log(`[CACHE MISS] ${cacheKey}`);
      const result = await originalMethod.apply(this, args);

      // Armazena no cache
      cache.set(cacheKey, result, ttlMs);

      return result;
    };

    return descriptor;
  };
}

/**
 * Gerenciador de invalidação de cache
 * Centraliza regras de quando invalidar cache baseado em Sequelize hooks
 */
export class CacheInvalidationManager {
  private cache = getGlobalCache();

  /**
   * Invalida cache após operações de escrita
   */
  static invalidateAfterCreate(modelName: string, attributes?: any) {
    const cache = getGlobalCache();
    const pattern = new RegExp(`^${modelName}:.*`, 'i');
    const invalidated = cache.invalidateByPattern(pattern);
    console.log(`[CACHE INVALIDATED] ${invalidated} entries for ${modelName}:*`);
  }

  static invalidateAfterUpdate(modelName: string, id?: string | number, attributes?: any) {
    const cache = getGlobalCache();
    
    // Invalida chaves específicas relacionadas a este item
    if (id) {
      cache.delete(`${modelName}:${id}`);
      console.log(`[CACHE INVALIDATED] ${modelName}:${id}`);
    }
    
    // Invalida listas (findAll, getAllXxx)
    const pattern = new RegExp(`^${modelName}:(list|findAll|all).*`, 'i');
    const invalidated = cache.invalidateByPattern(pattern);
    console.log(`[CACHE INVALIDATED] ${invalidated} list entries for ${modelName}`);
  }

  static invalidateAfterDestroy(modelName: string, id?: string | number) {
    const cache = getGlobalCache();
    
    // Invalida item específico
    if (id) {
      cache.delete(`${modelName}:${id}`);
      console.log(`[CACHE INVALIDATED] ${modelName}:${id}`);
    }
    
    // Invalida todas as listas
    const pattern = new RegExp(`^${modelName}:(list|findAll|all).*`, 'i');
    const invalidated = cache.invalidateByPattern(pattern);
    console.log(`[CACHE INVALIDATED] ${invalidated} list entries for ${modelName}`);
  }

  /**
   * Invalida cache por modelo específico
   */
  static invalidateModel(modelName: string): number {
    const cache = getGlobalCache();
    const pattern = new RegExp(`^${modelName}:.*`, 'i');
    return cache.invalidateByPattern(pattern);
  }

  /**
   * Invalida cache por padrão customizado
   */
  static invalidateByPattern(pattern: RegExp | string): number {
    return getGlobalCache().invalidateByPattern(pattern);
  }
}

/**
 * Constrói chave de cache a partir do prefixo e argumentos
 */
function buildCacheKey(prefix: string, args: any[]): string {
  const argString = args
    .map((arg) => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg);
      }
      return String(arg);
    })
    .join(':');

  return argString ? `${prefix}:${argString}` : prefix;
}

/**
 * Wrapper para servicios que precisam cachear dados
 */
export abstract class CachedService {
  protected cache = getGlobalCache();
  protected modelName: string = '';

  /**
   * Obtém chave de cache padronizada
   */
  protected getCacheKey(operation: string, ...params: any[]): string {
    const paramStr = params.length > 0 ? `:${params.join(':')}` : '';
    return `${this.modelName}:${operation}${paramStr}`;
  }

  /**
   * Obtém do cache ou executa função
   */
  protected async getCachedOrExecute<T>(
    cacheKey: string,
    fn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.cache.get<T>(cacheKey);
    if (cached !== null) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return cached;
    }

    console.log(`[CACHE MISS] ${cacheKey}`);
    const result = await fn();
    this.cache.set(cacheKey, result, ttlMs);
    return result;
  }

  /**
   * Invalida cache do modelo
   */
  protected invalidateModelCache(): void {
    CacheInvalidationManager.invalidateModel(this.modelName);
  }

  /**
   * Invalida por padrão
   */
  protected invalidateByPattern(pattern: RegExp): void {
    this.cache.invalidateByPattern(pattern);
  }
}

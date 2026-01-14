/**
 * Template Base para Refatorar Outros Serviços
 * Use como padrão para refatorar Person, Creative, etc.
 */

import { CachedService, CacheInvalidationManager } from '../cache/cache-invalidation';

/**
 * Base Service Template
 * Estende CachedService para herdar funcionalidades de cache
 */
export abstract class BaseService extends CachedService {
  protected abstract modelName: string;

  /**
   * Configurações de TTL específicas
   */
  protected readonly ttlStats = 5 * 60 * 1000;    // 5 min
  protected readonly ttlLists = 10 * 60 * 1000;   // 10 min
  protected readonly ttlDetail = 10 * 60 * 1000;  // 10 min

  /**
   * Padrão para criar recurso com invalidação
   */
  protected async createWithInvalidation<T>(
    createFn: () => Promise<T>,
  ): Promise<T> {
    const result = await createFn();
    CacheInvalidationManager.invalidateAfterCreate(this.modelName);
    return result;
  }

  /**
   * Padrão para atualizar recurso com invalidação
   */
  protected async updateWithInvalidation<T>(
    id: string | number,
    updateFn: () => Promise<T>,
  ): Promise<T> {
    const result = await updateFn();
    CacheInvalidationManager.invalidateAfterUpdate(this.modelName, id);
    return result;
  }

  /**
   * Padrão para deletar recurso com invalidação
   */
  protected async deleteWithInvalidation<T>(
    id: string | number,
    deleteFn: () => Promise<T>,
  ): Promise<T> {
    const result = await deleteFn();
    CacheInvalidationManager.invalidateAfterDestroy(this.modelName, id);
    return result;
  }

  /**
   * Padrão para listar com cache
   */
  protected async listWithCache<T>(
    cacheKey: string,
    findFn: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T> {
    return this.getCachedOrExecute(cacheKey, findFn, ttlMs || this.ttlLists);
  }

  /**
   * Padrão para detalhe com cache
   */
  protected async detailWithCache<T>(
    cacheKey: string,
    findFn: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T> {
    return this.getCachedOrExecute(cacheKey, findFn, ttlMs || this.ttlDetail);
  }

  /**
   * Padrão para estatísticas com cache
   */
  protected async statsWithCache<T>(
    cacheKey: string,
    calculateFn: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T> {
    return this.getCachedOrExecute(cacheKey, calculateFn, ttlMs || this.ttlStats);
  }
}

/**
 * Exemplo: Refatorar Person Service usando este padrão
 * 
 * ========== ANTES (ineficiente) ==========
 * 
 * export const getPerson = async (id: string) => {
 *   return Person.findByPk(id);
 * };
 * 
 * ========== DEPOIS (otimizado) ==========
 */
export class PersonServiceExample extends BaseService {
  protected modelName = 'Person';

  // Exemplo de função com cache
  async getById(id: string) {
    const cacheKey = this.getCacheKey('by-id', id);

    return this.detailWithCache(cacheKey, async () => {
      return Person.findByPk(id, {
        attributes: ['id', 'name', 'email', 'phone', 'role'],
        // Não carrega relacionamentos desnecessários
      });
    });
  }

  // Exemplo de list com cache
  async getAll(limit?: number, offset?: number) {
    const cacheKey = this.getCacheKey('list', limit, offset);

    return this.listWithCache(cacheKey, async () => {
      return Person.findAll({
        attributes: ['id', 'name', 'email', 'role', 'createdAt'],
        limit: limit || 50,
        offset: offset || 0,
        order: [['createdAt', 'DESC']],
      });
    });
  }

  // Exemplo de create com invalidação
  async create(data: any) {
    return this.createWithInvalidation(async () => {
      return Person.create(data);
    });
  }

  // Exemplo de update com invalidação
  async update(id: string, data: any) {
    return this.updateWithInvalidation(id, async () => {
      const person = await Person.findByPk(id);
      if (!person) throw new Error('Person not found');
      return person.update(data);
    });
  }

  // Exemplo de delete com invalidação
  async delete(id: string) {
    return this.deleteWithInvalidation(id, async () => {
      const person = await Person.findByPk(id);
      if (!person) throw new Error('Person not found');
      await person.destroy();
      return person;
    });
  }

  // Exemplo de stats com cache
  async getStats() {
    const cacheKey = this.getCacheKey('stats');

    return this.statsWithCache(cacheKey, async () => {
      const [total, admin, seller, affiliate] = await Promise.all([
        Person.count(),
        Person.count({ where: { role: 'ADMIN' } }),
        Person.count({ where: { role: 'SELLER' } }),
        Person.count({ where: { role: 'AFFILIATE' } }),
      ]);

      return { total, admin, seller, affiliate };
    });
  }
}

/**
 * Padrão para refatorar Creative Service
 * 
 * export class CreativeServiceExample extends BaseService {
 *   protected modelName = 'Creative';
 * 
 *   async getById(id: string) {
 *     const cacheKey = this.getCacheKey('by-id', id);
 *     return this.detailWithCache(cacheKey, async () => {
 *       return Creative.findByPk(id, {
 *         attributes: ['id', 'title', 'description', 'imageUrl', 'createdAt'],
 *       });
 *     });
 *   }
 * 
 *   async getAllByOwner(ownerId: string, limit?: number) {
 *     const cacheKey = this.getCacheKey('by-owner', ownerId, limit);
 *     return this.listWithCache(cacheKey, async () => {
 *       return Creative.findAll({
 *         where: { ownerId },
 *         attributes: ['id', 'title', 'imageUrl', 'createdAt'],
 *         limit: limit || 50,
 *         order: [['createdAt', 'DESC']],
 *       });
 *     });
 *   }
 * 
 *   async create(data: any) {
 *     return this.createWithInvalidation(async () => {
 *       return Creative.create(data);
 *     });
 *   }
 * }
 */

// ==================== EXPORTAR COMO SINGLETON ====================

let personServiceInstance: PersonServiceExample | null = null;

export function getPersonService(): PersonServiceExample {
  if (!personServiceInstance) {
    personServiceInstance = new PersonServiceExample();
  }
  return personServiceInstance;
}

/**
 * Uso em Controllers:
 * 
 * import { getPersonService } from '../services/person.service';
 * 
 * export const getPersonById = async (req, res, next) => {
 *   try {
 *     const service = getPersonService();
 *     const data = await service.getById(req.params.id);
 *     return ResponseBuilder.success(res, data);
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 */

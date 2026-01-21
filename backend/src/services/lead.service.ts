import { Lead, LeadStatus } from "../models/Lead";
import { Person } from "../models/Person";
import { Op } from "sequelize";
import { sendApprovalOrRejectionEmail } from "../utils/email";
import { env } from "../config/env";
import { Validator } from "../shared/Validator";
import { CachedService, CacheInvalidationManager } from "../cache/cache-invalidation";
import { adjustCredits } from "./credit.service";

// ===================== TIPOS =====================
export interface CreateLeadDto {
  name: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
  ownerId: string;
}

export interface UpdateLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
  status?: LeadStatus;
  notes?: string;
}

/**
 * Lead Service com suporte a Cache automático e queries otimizadas
 * Herda de CachedService para funcionalidades de cache reutilizáveis
 */
export class LeadService extends CachedService {
  protected modelName = 'Lead';
  
  // TTLs específicas por operação
  private readonly ttlStats = 5 * 60 * 1000; // 5 minutos para estatísticas
  private readonly ttlLists = 10 * 60 * 1000; // 10 minutos para listas
  private readonly ttlDetail = 10 * 60 * 1000; // 10 minutos para detalhes

  getTtlStats() { return this.ttlStats; }
  getTtlLists() { return this.ttlLists; }
  getTtlDetail() { return this.ttlDetail; }
}

/**
 * Cria um novo lead com validação e invalidação automática de cache
 * 
 * Validações:
 * - Images em base64 (max 2MB)
 * 
 * Cache invalidado após criação
 */
async function createLead(data: CreateLeadDto) {
  const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
  if (data.energyBill) {
    Validator.isBase64DataUrl(data.energyBill, 'Conta de energia');
    Validator.maxBase64Size(data.energyBill, MAX_IMAGE_BYTES, 'Conta de energia');
  }
  if (data.roofPhoto) {
    Validator.isBase64DataUrl(data.roofPhoto, 'Foto do telhado');
    Validator.maxBase64Size(data.roofPhoto, MAX_IMAGE_BYTES, 'Foto do telhado');
  }

  const lead = await Lead.create(data as any);
  
  // Invalida cache de listas após criação
  CacheInvalidationManager.invalidateAfterCreate('Lead');

  await lead.reload({
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name', 'email', 'phone'],
    }],
  });
  return lead;
}

/**
 * Busca todos os leads com filtros opcionais
 * 
 * Otimizações:
 * - Usa attributes específicas (sem SELECT *)
 * - Cacheia resultado por 10 minutos
 * - Suporta filtros por status e ownerId
 */
async function getAllLeads(filters?: {
  status?: LeadStatus;
  ownerId?: string;
  limit?: number;
  offset?: number;
}) {
  const service = new LeadService();
  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.ownerId) where.ownerId = filters.ownerId;

  // Cria chave de cache com filtros
  const cacheKey = service.getCacheKey('list', JSON.stringify(filters || {}));

  return service.getCachedOrExecute(cacheKey, async () => {
    const limit = filters?.limit || 50; // Padrão: 50 itens
    const offset = filters?.offset || 0;

    return Lead.findAll({
      where,
      attributes: ['id', 'name', 'status', 'createdAt', 'email', 'phone', 'ownerId'],
      include: [{
        model: Person,
        as: 'owner',
        attributes: ['id', 'name'],
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      raw: false, // Mantém instâncias para suportar includes
    });
  }, service.getTtlLists());
}

/**
 * Busca leads de um vendedor específico
 * 
 * Otimizações:
 * - Attributes limitados
 * - Cache por 10 minutos
 * - Paginação
 */
async function getLeadsByOwner(ownerId: string, limit?: number, offset?: number) {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('by-owner', ownerId, limit, offset);

  return service.getCachedOrExecute(cacheKey, async () => {
    return Lead.findAll({
      where: { ownerId },
      attributes: ['id', 'name', 'status', 'createdAt', 'email', 'phone'],
      order: [['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });
  }, service.getTtlLists());
}

/**
 * Busca um lead específico pelo ID
 * 
 * Otimizações:
 * - Cache por 10 minutos
 * - Detalhes completos com owner
 */
async function getLeadById(id: string) {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('by-id', id);

  return service.getCachedOrExecute(cacheKey, async () => {
    const lead = await Lead.findByPk(id, {
      attributes: ['id', 'name', 'status', 'createdAt', 'email', 'phone', 'energyBill', 'roofPhoto', 'notes'],
      include: [{
        model: Person,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone'],
      }],
    });

    if (!lead) {
      throw new Error("Lead não encontrado");
    }

    return lead;
  }, service.getTtlDetail());
}

/**
 * Atualiza um lead com invalidação de cache automática
 * 
 * Otimizações:
 * - Invalida apenas caches relacionados
 * - Evita reloads desnecessários
 */
async function updateLead(id: string, data: UpdateLeadDto) {
  const lead = await Lead.findByPk(id);
  if (!lead) throw new Error("Lead não encontrado");
  
  await lead.update(data);
  
  // Invalida caches específicos deste lead e de listas
  CacheInvalidationManager.invalidateAfterUpdate('Lead', id);

  await lead.reload({
    attributes: ['id', 'name', 'status', 'email', 'phone', 'energyBill', 'roofPhoto', 'notes'],
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name'],
    }],
  });
  
  return lead;
}

/**
 * Atualiza apenas o status de um lead
 * 
 * Inclusões:
 * - Notifica vendedor se mudou para BOUGHT
 */
async function updateLeadStatus(id: string, status: LeadStatus) {
  const lead = await Lead.findByPk(id, {
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name', 'email'],
    }],
  });
  if (!lead) throw new Error("Lead não encontrado");

  const previousStatus = lead.status;

  await lead.update({ status });

  // Recarrega para garantir owner atualizado
  await lead.reload({
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name', 'email'],
    }],
  });

  // Invalida caches
  CacheInvalidationManager.invalidateAfterUpdate('Lead', id);

  // Se o status mudou para BOUGHT, notifica o vendedor (caso tenha email) e dá créditos
  try {
    if (previousStatus !== LeadStatus.BOUGHT && status === LeadStatus.BOUGHT) {
      const owner = (lead as any).owner as Person | undefined;
      if (owner && owner.email) {
        const subject = '🎉 Cliente Finalizou Compra - 5K Energia Solar';
        const message = `O cliente ${lead.name} finalizou a compra.`;
        const buttonText = 'Ver no Painel';
        const buttonUrl = `${env.FRONTEND_URL}/seller/dashboard`;

        await sendApprovalOrRejectionEmail(owner.email, owner.name, subject, message, buttonText, buttonUrl);
      }

      // Atribuir créditos ao owner do lead (SELLER ou AFFILIATE)
      if (owner) {
        const creditAmount = 10; // 10 créditos por lead convertido
        const reason = `Lead convertido: ${lead.name}`;

        try {
          await adjustCredits(owner.id, creditAmount, reason, 'SYSTEM');
          console.log(`Créditos atribuídos: ${creditAmount} para ${owner.name} (${owner.role}) pelo lead ${lead.name}`);
        } catch (creditError) {
          console.error('Erro ao atribuir créditos:', creditError);
          // Não falha a operação se não conseguir dar créditos
        }
      }
    }
  } catch (err) {
    console.error('Erro ao enviar email de notificação de compra:', err);
  }

  return lead;
}

/**
 * Deleta um lead com invalidação de cache
 */
async function deleteLead(id: string) {
  const lead = await Lead.findByPk(id);
  if (!lead) throw new Error("Lead não encontrado");
  
  await lead.destroy();
  
  // Invalida caches relacionados
  CacheInvalidationManager.invalidateAfterDestroy('Lead', id);
  
  return lead;
}

/**
 * Retorna estatísticas de leads com cache
 * 
 * Cache: 5 minutos
 */
async function getLeadsStats() {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('stats');

  return service.getCachedOrExecute(cacheKey, async () => {
    const [total, bought, negotiation, cancelled] = await Promise.all([
      Lead.count(),
      Lead.count({ where: { status: LeadStatus.BOUGHT } }),
      Lead.count({ where: { status: LeadStatus.NEGOTIATION } }),
      Lead.count({ where: { status: LeadStatus.CANCELLED } }),
    ]);

    return {
      total,
      bought,
      negotiation,
      cancelled,
      conversionRate: total > 0 ? ((bought / total) * 100).toFixed(2) + "%" : "0%",
    };
  }, service.getTtlStats());
}

/**
 * Retorna novos leads dos últimos N dias
 * 
 * Otimizações:
 * - Attributes específicas
 * - Cache por 5 minutos
 */
async function getNewLeads(days: number = 7) {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('new', days);

  return service.getCachedOrExecute(cacheKey, async () => {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return Lead.findAll({
      where: {
        createdAt: {
          [Op.gte]: date,
        },
      },
      attributes: ['id', 'name', 'status', 'createdAt', 'email', 'phone', 'ownerId'],
      include: [{
        model: Person,
        as: 'owner',
        attributes: ['id', 'name'],
      }],
      order: [['createdAt', 'DESC']],
    });
  }, service.getTtlStats());
}

/**
 * Retorna leads de um vendedor com detalhes
 * 
 * Otimizações:
 * - Attributes limitadas
 * - Paginação
 */
async function getSellerLeads(sellerId: string, filters?: { 
  status?: LeadStatus;
  limit?: number;
  offset?: number;
}) {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('seller', sellerId, JSON.stringify(filters || {}));

  return service.getCachedOrExecute(cacheKey, async () => {
    const where: any = { ownerId: sellerId };
    if (filters?.status) where.status = filters.status;

    return Lead.findAll({
      where,
      attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    });
  }, service.getTtlLists());
}

/**
 * Retorna um lead específico de um vendedor
 */
async function getSellerLeadById(sellerId: string, leadId: string) {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('seller-by-id', sellerId, leadId);

  return service.getCachedOrExecute(cacheKey, async () => {
    const lead = await Lead.findOne({
      where: {
        id: leadId,
        ownerId: sellerId,
      },
      attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt', 'energyBill', 'roofPhoto', 'notes'],
    });

    if (!lead) {
      throw new Error("Lead não encontrado");
    }

    return lead;
  }, service.getTtlDetail());
}

/**
 * Retorna estatísticas de leads de um vendedor específico
 * 
 * Cache: 5 minutos
 */
async function getSellerLeadsStats(sellerId: string) {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('seller-stats', sellerId);

  return service.getCachedOrExecute(cacheKey, async () => {
    const [total, bought, negotiation, cancelled] = await Promise.all([
      Lead.count({ where: { ownerId: sellerId } }),
      Lead.count({ where: { ownerId: sellerId, status: LeadStatus.BOUGHT } }),
      Lead.count({ where: { ownerId: sellerId, status: LeadStatus.NEGOTIATION } }),
      Lead.count({ where: { ownerId: sellerId, status: LeadStatus.CANCELLED } }),
    ]);

    return {
      total,
      bought,
      negotiation,
      cancelled,
      conversionRate: total > 0 ? ((bought / total) * 100).toFixed(2) + "%" : "0%",
    };
  }, service.getTtlStats());
}

/**
 * Retorna leads do usuário autenticado com filtro por role
 * 
 * Otimizações:
 * - Atributos limitados por role
 * - Cache por 10 minutos
 */
async function getLeadsByPersonRole(userId: string, userRole: string, limit?: number, offset?: number) {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('by-role', userId, userRole, limit, offset);

  return service.getCachedOrExecute(cacheKey, async () => {
    const attributes = userRole === 'AFFILIATE'
      ? ['id', 'name', 'status', 'createdAt']
      : ['id', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt', 'energyBill', 'roofPhoto', 'notes'];

    return Lead.findAll({
      where: { ownerId: userId },
      attributes,
      order: [['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });
  }, service.getTtlLists());
}

// ===================== EXPORTAR FUNÇÕES DO SERVIÇO =====================
export const LeadServiceFunctions = {
  createLead,
  getAllLeads,
  getLeadsByOwner,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadsStats,
  getNewLeads,
  getSellerLeads,
  getSellerLeadById,
  getSellerLeadsStats,
  getLeadsByPersonRole,
};

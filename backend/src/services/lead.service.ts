import { Lead, LeadStatus } from "../models/Lead";
import { Person } from "../models/Person";
import { Op } from "sequelize";
import { sendApprovalOrRejectionEmail } from "../utils/email";
import { env } from "../config/env";
import { Validator } from "../shared/Validator";
import { CachedService, CacheInvalidationManager } from "../cache/cache-invalidation";
import { adjustCredits, addCommissionCredits } from "./credit.service";
import { uploadBase64ToS3 } from "./storage.service";
import { addCreditTransaction } from "./credit.service";
import { CreditTransactionType } from "../models/CreditTransaction";
import { fileLogger } from "../utils/file-logger";

// ===================== TIPOS =====================
export interface CreateLeadDto {
  name: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
  city?: string;
  state?: string;
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
  console.log('[Lead Service] ===== INICIANDO CRIAÇÃO DE LEAD =====');
  console.log('[Lead Service] Dados recebidos:', {
    name: data.name,
    email: data.email,
    phone: data.phone,
    city: data.city,
    state: data.state,
    ownerId: data.ownerId,
    hasEnergyBill: !!data.energyBill,
    hasRoofPhoto: !!data.roofPhoto,
  });

  // CRITICAL VALIDATION: ownerId MUST be provided and valid
  if (!data.ownerId || typeof data.ownerId !== 'string' || data.ownerId.trim() === '') {
    console.error('[Lead Service] ❌ ERRO CRÍTICO: ownerId não fornecido ou inválido!', {
      ownerId: data.ownerId,
      type: typeof data.ownerId,
    });
    throw new Error('ownerId é obrigatório para criar um lead');
  }

  // Validate ownerId is a valid UUID
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.ownerId)) {
    console.error('[Lead Service] ❌ ERRO: ownerId não é um UUID válido!', data.ownerId);
    throw new Error(`ownerId fornecido não é um UUID válido: ${data.ownerId}`);
  }

  const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
  
  // Validar e processar energyBill
  if (data.energyBill) {
    try {
      console.log('[Lead Service] Validando conta de energia...');
      Validator.isBase64DataUrl(data.energyBill, 'Conta de energia');
      Validator.maxBase64Size(data.energyBill, MAX_IMAGE_BYTES, 'Conta de energia');
      console.log('[Lead Service] ✓ Conta de energia validada');
    } catch (error: any) {
      console.error('[Lead Service] ✗ Validação da conta de energia falhou:', error.message);
      throw error;
    }
  }

  // Validar e processar roofPhoto
  if (data.roofPhoto) {
    try {
      console.log('[Lead Service] Validando foto do telhado...');
      Validator.isBase64DataUrl(data.roofPhoto, 'Foto do telhado');
      Validator.maxBase64Size(data.roofPhoto, MAX_IMAGE_BYTES, 'Foto do telhado');
      console.log('[Lead Service] ✓ Foto do telhado validada');
    } catch (error: any) {
      console.error('[Lead Service] ✗ Validação da foto do telhado falhou:', error.message);
      throw error;
    }
  }

  // Processar imagens para S3 se existirem
  const processedData = { ...data };
  
  if (data.energyBill) {
    try {
      console.log('[Lead Service] 🚀 Iniciando upload da conta de energia para S3...');
      const energyBillUrl = await uploadBase64ToS3(data.energyBill, 'energy-bill.jpg', 'leads');
      console.log('[Lead Service] ✓ Conta de energia enviada com sucesso');
      console.log('[Lead Service] URL:', energyBillUrl);
      processedData.energyBill = energyBillUrl;
    } catch (error: any) {
      console.error('[Lead Service] ✗ Erro ao fazer upload da conta de energia:', error.message);
      throw error; // Relançar erro em vez de silenciar
    }
  }
  
  if (data.roofPhoto) {
    try {
      console.log('[Lead Service] 🚀 Iniciando upload da foto do telhado para S3...');
      const roofPhotoUrl = await uploadBase64ToS3(data.roofPhoto, 'roof-photo.jpg', 'leads');
      console.log('[Lead Service] ✓ Foto do telhado enviada com sucesso');
      console.log('[Lead Service] URL:', roofPhotoUrl);
      processedData.roofPhoto = roofPhotoUrl;
    } catch (error: any) {
      console.error('[Lead Service] ✗ Erro ao fazer upload da foto do telhado:', error.message);
      throw error; // Relançar erro em vez de silenciar
    }
  }

  console.log('[Lead Service] 💾 Salvando lead no banco de dados...');
  console.log('[Lead Service] Dados a serem salvos:', {
    name: processedData.name,
    email: processedData.email,
    phone: processedData.phone,
    city: processedData.city,
    state: processedData.state,
    ownerId: processedData.ownerId,
    hasEnergyBill: !!processedData.energyBill,
    hasRoofPhoto: !!processedData.roofPhoto,
  });
  
  const lead = await Lead.create(processedData as any);
  
  console.log('[Lead Service] ✓ Lead criado com ID:', lead.id);
  
  // Invalida cache de listas após criação
  CacheInvalidationManager.invalidateAfterCreate('Lead');

  console.log('[Lead Service] 🔄 Recarregando lead do banco de dados...');
  await lead.reload({
    attributes: ['id', 'name', 'status', 'email', 'phone', 'energyBill', 'roofPhoto', 'notes', 'city', 'state', 'ownerId', 'createdAt', 'updatedAt'],
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name', 'email', 'phone'],
    }],
  });
  
  const jsonData = lead.toJSON();
  console.log('[Lead Service] ✓ Lead após reload:', {
    id: jsonData.id,
    name: jsonData.name,
    email: jsonData.email,
    phone: jsonData.phone,
    city: jsonData.city,
    state: jsonData.state,
    ownerId: jsonData.ownerId,
    owner: jsonData.owner ? { id: jsonData.owner.id, name: jsonData.owner.name } : null,
    hasEnergyBill: !!jsonData.energyBill,
    hasRoofPhoto: !!jsonData.roofPhoto,
  });
  
  console.log('[Lead Service] ===== CRIAÇÃO DE LEAD CONCLUÍDA COM SUCESSO =====');
  
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
      attributes: ['id', 'name', 'status', 'createdAt', 'email', 'phone', 'ownerId', 'city', 'state', 'energyBill', 'roofPhoto', 'commissionAmount'],
      include: [{
        model: Person,
        as: 'owner',
        attributes: ['id', 'name'],
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      raw: false,
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
    const query = `
      SELECT l."id", l."name", l."status", l."createdAt", l."email", l."phone", l."energyBill", l."roofPhoto", l."city", l."state",
             COALESCE(ct.total_commission, 0) as "commissionAmount"
      FROM "Lead" l
      LEFT JOIN (
        SELECT "leadId", "personId", SUM(amount) as total_commission
        FROM "CreditTransaction"
        WHERE type = 'COMMISSION'
        GROUP BY "leadId", "personId"
      ) ct ON l.id = ct."leadId" AND ct."personId" = $ownerId
      WHERE l."ownerId" = $ownerId
      ORDER BY l."createdAt" DESC
      LIMIT $limit OFFSET $offset
    `;

    const queryResult: any = await Lead.sequelize!.query(query, {
      bind: {
        ownerId,
        limit: limit || 50,
        offset: offset || 0
      },
      type: 'SELECT'
    });

    // Normalize different return shapes from sequelize.query
    let results: any[] = [];
    if (Array.isArray(queryResult)) {
      if (Array.isArray(queryResult[0])) {
        results = queryResult[0];
      } else {
        results = queryResult as any[];
      }
    } else if (queryResult && Array.isArray(queryResult.rows)) {
      results = queryResult.rows;
    }

    // Normalize commissionAmount (Postgres returns numeric/decimal as strings)
    const normalized = results.map(r => ({
      ...r,
      commissionAmount: r && r.commissionAmount != null ? Number(r.commissionAmount) : 0,
    }));

    return normalized;
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
      attributes: ['id', 'name', 'status', 'createdAt', 'email', 'phone', 'energyBill', 'roofPhoto', 'notes', 'city', 'state', 'commissionAmount'],
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
    attributes: ['id', 'name', 'status', 'email', 'phone', 'energyBill', 'roofPhoto', 'notes', 'city', 'state'],
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
async function updateLeadStatus(id: string, status: LeadStatus, commissionAmount?: number) {
  const lead = await Lead.findByPk(id, {
    include: [{
      model: Person,
      as: 'owner',
      attributes: ['id', 'name', 'email'],
    }],
  });
  if (!lead) throw new Error("Lead não encontrado");

  const previousStatus = lead.status;

  // Validate commissionAmount if provided
  if (commissionAmount != null && (!Number.isFinite(commissionAmount) || commissionAmount < 0)) {
    throw new Error('Invalid commission amount');
  }

  // If an explicit positive commissionAmount is provided, create commission (which will mark lead as BOUGHT)
  if (commissionAmount != null && commissionAmount > 0) {
    const owner = (lead as any).owner as Person | undefined;
    if (owner) {
      const reason = `Comissão atribuída via atualização de status: ${lead.name}`;
      try {
        await addCommissionCredits(owner.id, commissionAmount, lead.id, reason);
        // reload lead after commission application (addCommissionCredits updates lead)
        await lead.reload({
          include: [{
            model: Person,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          }],
        });
      } catch (creditError) {
        console.error('Erro ao atribuir créditos:', creditError);
        throw creditError;
      }
    }
  } else {
    // No positive commission provided: only update status (do not create zero-value commission)
    const updateData: any = { status };
    if (commissionAmount != null) {
      // only set commissionAmount when explicitly provided (even if zero) to preserve intent
      updateData.commissionAmount = commissionAmount;
    }

    await lead.update(updateData);

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
    const whereStatus = filters?.status ? `AND l."status" = '${filters?.status}'` : '';
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const query = `
      SELECT l."id", l."name", l."email", l."phone", l."status", l."createdAt", l."updatedAt",
             COALESCE(ct.total_commission, 0) as "commissionAmount"
      FROM "Lead" l
      LEFT JOIN (
        SELECT "leadId", "personId", SUM(amount) as total_commission
        FROM "CreditTransaction"
        WHERE type = 'COMMISSION'
        GROUP BY "leadId", "personId"
      ) ct ON l.id = ct."leadId" AND ct."personId" = $sellerId
      WHERE l."ownerId" = $sellerId ${whereStatus}
      ORDER BY l."createdAt" DESC
      LIMIT $limit OFFSET $offset
    `;

    const queryResult: any = await Lead.sequelize!.query(query, {
      bind: { sellerId, limit, offset },
      type: 'SELECT'
    });

    let results: any[] = [];
    if (Array.isArray(queryResult)) {
      if (Array.isArray(queryResult[0])) {
        results = queryResult[0];
      } else {
        results = queryResult as any[];
      }
    } else if (queryResult && Array.isArray(queryResult.rows)) {
      results = queryResult.rows;
    }

    const normalized = results.map(r => ({
      ...r,
      commissionAmount: r && r.commissionAmount != null ? Number(r.commissionAmount) : 0,
    }));

    return normalized;
  }, service.getTtlLists());
}

/**
 * Retorna um lead específico de um vendedor
 */
async function getSellerLeadById(sellerId: string, leadId: string) {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('seller-by-id', sellerId, leadId);

  return service.getCachedOrExecute(cacheKey, async () => {
    const query = `
      SELECT l."id", l."name", l."email", l."phone", l."status", l."createdAt", l."updatedAt", l."energyBill", l."roofPhoto", l."notes",
             COALESCE(ct.total_commission, 0) as "commissionAmount"
      FROM "Lead" l
      LEFT JOIN (
        SELECT "leadId", "personId", SUM(amount) as total_commission
        FROM "CreditTransaction"
        WHERE type = 'COMMISSION'
        GROUP BY "leadId", "personId"
      ) ct ON l.id = ct."leadId" AND ct."personId" = $sellerId
      WHERE l.id = $leadId AND l."ownerId" = $sellerId
      LIMIT 1
    `;

    const qr: any = await Lead.sequelize!.query(query, {
      bind: { sellerId, leadId },
      type: 'SELECT'
    });

    const row = Array.isArray(qr) && qr.length ? (Array.isArray(qr[0]) ? qr[0][0] : qr[0]) : null;
    if (!row) throw new Error("Lead não encontrado");
    row.commissionAmount = row.commissionAmount != null ? Number(row.commissionAmount) : 0;
    return row;
  }, service.getTtlDetail());
}

async function getSellerLeadsStats(sellerId: string) {
  const service = new LeadService();
  const cacheKey = service.getCacheKey('seller-stats', sellerId);

  console.log('[LeadService.getSellerLeadsStats] Iniciando cálculo de stats para sellerId:', sellerId);
  fileLogger.logStats({
    context: 'getSellerLeadsStats_start',
    sellerId,
    cacheKey,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await service.getCachedOrExecute(cacheKey, async () => {
      console.log('[LeadService.getSellerLeadsStats] Executando query (não vindo de cache) para sellerId:', sellerId);
      fileLogger.logStats({
        context: 'getSellerLeadsStats_cache_miss',
        sellerId,
        timestamp: new Date().toISOString(),
      });
      
      // Validar que sellerId não é vazio/null
      if (!sellerId || typeof sellerId !== 'string' || sellerId.trim() === '') {
        console.error('[LeadService.getSellerLeadsStats] ❌ ERRO: sellerId inválido:', sellerId);
        fileLogger.logError('getSellerLeadsStats_invalid_sellerId', new Error(`sellerId inválido: ${sellerId}`));
        throw new Error(`sellerId inválido: ${sellerId}`);
      }

      try {
        // Query com detalhes de debug
        console.log('[LeadService.getSellerLeadsStats] Testando conexão com DB...');
        
        const [total, bought, negotiation, cancelled] = await Promise.all([
          Lead.count({ where: { ownerId: sellerId } }),
          Lead.count({ where: { ownerId: sellerId, status: LeadStatus.BOUGHT } }),
          Lead.count({ where: { ownerId: sellerId, status: LeadStatus.NEGOTIATION } }),
          Lead.count({ where: { ownerId: sellerId, status: LeadStatus.CANCELLED } }),
        ]);

        console.log('[LeadService.getSellerLeadsStats] Resultados da query:', {
          sellerId,
          total,
          bought,
          negotiation,
          cancelled,
        });

        fileLogger.logStats({
          context: 'getSellerLeadsStats_query_results',
          sellerId,
          total,
          bought,
          negotiation,
          cancelled,
          timestamp: new Date().toISOString(),
        });

        // Validação: Se total é 0, buscar todos os leads para verificar se há algum com esse ownerId
        if (total === 0) {
          console.warn('[LeadService.getSellerLeadsStats] ⚠️ AVISO: Total de leads é 0 para este vendedor');
          
          // Debug: Contar TODOS os leads e seus ownerIds
          const allLeads = await Lead.findAll({
            attributes: ['id', 'ownerId', 'name'],
            limit: 5,
          });
          
          const sample = allLeads.map(l => ({
            id: l.id,
            ownerId: l.ownerId,
            name: l.name,
            isOwned: l.ownerId === sellerId
          }));

          console.warn('[LeadService.getSellerLeadsStats] Amostra de primeiros 5 leads do DB:', sample);
          
          fileLogger.logStats({
            context: 'getSellerLeadsStats_zero_leads_debug',
            sellerId,
            totalLeadsInDb: allLeads.length,
            sample,
            timestamp: new Date().toISOString(),
          });
        }

        const result = {
          total,
          bought,
          negotiation,
          cancelled,
          conversionRate: total > 0 ? ((bought / total) * 100).toFixed(2) + "%" : "0%",
        };

        console.log('[LeadService.getSellerLeadsStats] Resultado final:', result);
        fileLogger.logStats({
          context: 'getSellerLeadsStats_result',
          sellerId,
          result,
          timestamp: new Date().toISOString(),
        });
        
        return result;
      } catch (queryError) {
        console.error('[LeadService.getSellerLeadsStats] ❌ Erro ao executar query de stats:', queryError);
        fileLogger.logError('getSellerLeadsStats_query_error', queryError);
        throw queryError;
      }
    }, service.getTtlStats());
    
    // Validar resultado final
    if (!result || typeof result !== 'object') {
      console.error('[LeadService.getSellerLeadsStats] ❌ ERRO CRÍTICO: resultado inválido:', result);
      fileLogger.logError('getSellerLeadsStats_invalid_result', new Error(`Resultado inválido: ${result}`));
      throw new Error('Resultado de stats é inválido');
    }
    
    return result;
  } catch (finalError) {
    console.error('[LeadService.getSellerLeadsStats] ❌ ERRO FATAL em getSellerLeadsStats:', finalError);
    fileLogger.logError('getSellerLeadsStats_fatal', finalError);
    
    // Retornar objeto padrão com erro explicativo
    const fallback = {
      total: 0,
      bought: 0,
      negotiation: 0,
      cancelled: 0,
      conversionRate: '0%',
      error: finalError instanceof Error ? finalError.message : String(finalError),
    };
    console.log('[LeadService.getSellerLeadsStats] ⚠️ Retornando fallback:', fallback);
    fileLogger.logStats({
      context: 'getSellerLeadsStats_fallback',
      sellerId,
      fallback,
      timestamp: new Date().toISOString(),
    });
    
    return fallback;
  }
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
    const baseAttributes = userRole === 'AFFILIATE'
      ? ['id', 'name', 'status', 'createdAt']
      : ['id', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt', 'energyBill', 'roofPhoto', 'notes'];

    // Usar query raw para incluir commissionAmount
    const query = `
      SELECT ${baseAttributes.map(attr => `"${attr}"`).join(', ')},
             COALESCE(ct.total_commission, 0) as "commissionAmount"
      FROM "Lead" l
      LEFT JOIN (
        SELECT "leadId", "personId", SUM(amount) as total_commission
        FROM "CreditTransaction"
        WHERE type = 'COMMISSION'
        GROUP BY "leadId", "personId"
      ) ct ON l.id = ct."leadId" AND ct."personId" = $userId
      WHERE l."ownerId" = $userId
      ORDER BY l."createdAt" DESC
      LIMIT $limit OFFSET $offset
    `;

    const queryResult: any = await Lead.sequelize!.query(query, {
      bind: {
        userId,
        limit: limit || 50,
        offset: offset || 0
      },
      type: 'SELECT'
    });

    // Normalize different return shapes from sequelize.query
    let results: any[] = [];
    if (Array.isArray(queryResult)) {
      if (Array.isArray(queryResult[0])) {
        results = queryResult[0];
      } else {
        results = queryResult as any[];
      }
    } else if (queryResult && Array.isArray(queryResult.rows)) {
      results = queryResult.rows;
    }

    // Normalize commissionAmount (Postgres returns numeric/decimal as strings)
    const normalized = results.map(r => ({
      ...r,
      commissionAmount: r && r.commissionAmount != null ? Number(r.commissionAmount) : 0,
    }));

    return normalized;
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
